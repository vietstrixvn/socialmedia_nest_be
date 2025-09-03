import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from 'src/common';
import { Provider } from 'src/common/enums/provider.enum';
import { UserDocument, UserEntity } from 'src/entities/user.entity';
import { generateTokens } from 'src/middlewares/generateTokens.middleware';
import {
  CreateUserGithubDto,
  CreateUserGoogleDto,
} from 'src/modules/user/dto/create-user.dto';
import { UserService } from 'src/modules/user/user.service';
import refreshJwtConfig from '../../configs/refresh-jwt.config';
import { LogInDTO } from './dtos/log-in.dto';
import { LogInResponse } from './responeses/log-in.response';
import { CurrentUser } from './types/current-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,

    private readonly configService: ConfigService,

    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,

    private readonly jwtService: JwtService,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async onModuleInit() {
    await this.createUserAccount();
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }
    generateTokens;
    if (!user.password) {
      throw new UnauthorizedException(
        'User registered with social login, no password set',
      );
    }

    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user._id };
  }

  async login(_id: string) {
    const { accessToken, refreshToken } = await generateTokens(
      _id,
      this.jwtService,
      this.refreshTokenConfig,
    );
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(_id, hashedRefreshToken);
    return {
      id: _id,
      accessToken,
      refreshToken,
    };
  }

  async userLogin(dto: LogInDTO): Promise<LogInResponse> {
    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException('wrong dât');
    }

    const user = (await this.userModel
      .findOne({
        $or: [{ username: dto.username }, { email: dto.username }],
      })
      .select('+password')) as UserDocument | null;

    const isValidPassword = user
      ? await user.comparePassword(dto.password)
      : false;

    if (!user || !isValidPassword) {
      throw new BadRequestException('wrong');
    }

    const { accessToken, refreshToken } = await generateTokens(
      user._id.toString(),
      this.jwtService, // ← truyền cái này nè
      this.refreshTokenConfig, // ← và cái này nữa
    );

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(
      user._id.toString(),
      hashedRefreshToken,
    );

    return {
      _id: user._id.toString(),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(_id: string) {
    const { accessToken, refreshToken } = await generateTokens(
      _id,
      this.jwtService,
      this.refreshTokenConfig,
    );

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(_id, hashedRefreshToken);

    return {
      id: _id,
      accessToken,
      refreshToken,
    };
  }

  async createUserAccount() {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');

    try {
      const existingAdmin = await this.userModel.findOne();

      if (existingAdmin?._id) {
        return;
      }

      if (existingAdmin) {
        console.log('Found admin account with null ID, removing...');

        await this.userModel.deleteOne({ username: adminUsername });
      }

      const adminPayload = {
        username: this.configService.get<string>('CUSTOMER_USERNAME'),
        password: this.configService.get<string>('CUSTOMER_PASSWORD'),
        email: this.configService.get<string>('CUSTOMER_EMAIL'),
        firstName: this.configService.get<string>('CUSTOMER_FRIST_NAME'),
        lastName: this.configService.get<string>('CUSTOMER_LAST_NAME'),
        phone_number: this.configService.get<string>('CUSTOMER_TEL'),
        role: UserRole.Owner,
      };
      const user = new this.userModel(adminPayload);

      const savedUser = await user.save();
      console.log(
        `[SUCCESS]  Customer created successfully with ID: ${savedUser._id}`,
      );
      return savedUser;
    } catch (error) {
      console.log('Customer account creation failed:', error);

      throw error;
    }
  }

  async signOut(_id: string) {
    await this.userService.updateHashedRefreshToken(_id, null);
  }

  async validateJwtUser(_id: string) {
    const user = await this.userService.findOne(_id);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = {
      id: user.id,
      username: user.username ?? user.email,
      email: user.email,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    };
    return currentUser;
  }

  async validateGoogleUser(googleUser: CreateUserGoogleDto) {
    // 👀 Ưu tiên tìm theo providerId trước
    let user = await this.userService.findByProviderId(googleUser.sub);

    // 👀 Nếu chưa có thì fallback tìm theo email
    if (!user) {
      user = await this.userService.findByEmail(googleUser.email);
    }

    // ✅ Nếu đã tồn tại thì return
    if (user) return user;

    // ❗ Tạo mới nếu chắc chắn chưa tồn tại
    return await this.userService.ggCreate({
      ...googleUser,
      provider: Provider.Google,
      verified: true,
      providerId: googleUser.sub,
    });
  }

  async validateGithubUser(githubUser: CreateUserGithubDto) {
    // 👀 Ưu tiên tìm theo providerId trước (GitHub user id)
    let user = await this.userService.findByProviderId(githubUser.providerId);

    // 👀 Nếu chưa có, thử tìm theo email (nếu có email)
    if (!user && githubUser.email) {
      user = await this.userService.findByEmail(githubUser.email);

      // ⚠️ Check nếu user này đã có provider khác (local, Google...) thì không override
      if (user && user.provider !== Provider.Github) {
        throw new UnauthorizedException(
          `Email này đã được đăng ký bằng ${user.provider}, không thể dùng GitHub để đăng nhập.`,
        );
      }
    }

    // ✅ Nếu user đã tồn tại thì return
    if (user) return user;

    // ❗ Nếu chắc chắn chưa có, thì tạo mới
    return await this.userService.ghCreate({
      ...githubUser,
      provider: Provider.Github,
      verified: true,
      providerId: githubUser.providerId,
    });
  }
}
