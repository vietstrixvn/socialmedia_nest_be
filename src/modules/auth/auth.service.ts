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
import { Provider } from 'src/common/enums/provider.enum';
import { Role } from 'src/common/enums/role.enum';
import { UserDocument, UserEntity } from 'src/entities/user.entity';
import { generateTokens } from 'src/middlewares/generateTokens.middleware';
import {
  CreateUserGithubDto,
  CreateUserGoogleDto,
} from 'src/modules/user/dtos/create-user.dto';
import { UserService } from 'src/modules/user/user.service';
import refreshJwtConfig from '../../configs/refresh-jwt.config';
import { LogInDTO } from './dtos/ log-in.dto';
import { LogInResponse } from './responses/log-in.response';
import { CurrentUser } from './types/current-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,

    private readonly configService: ConfigService,

    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>, // <-- đúng chỗ rồi nè

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

    return { id: user.id };
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
      throw new BadRequestException('wrong data');
    }

    const user = await this.userModel
      .findOne({
        $or: [{ username: dto.username }, { email: dto.username }],
      })
      .select('+password');

    // Check user trước khi gọi method
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValid = await user.comparePassword(dto.password);

    if (!isValid) {
      throw new BadRequestException('Wrong password');
    }

    const { accessToken, refreshToken } = await generateTokens(
      user._id.toString(),
      this.jwtService,
      this.refreshTokenConfig,
    );

    return {
      id: user._id.toString(), // map _id -> id
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
        username: this.configService.get<string>('USERNAME'),
        password: this.configService.get<string>('PASSWORD'),
        email: this.configService.get<string>('EMAIL'),
        firstName: this.configService.get<string>('FRIST_NAME'),
        lastName: this.configService.get<string>('LAST_NAME'),
        phone_number: this.configService.get<string>('TEL'),
        role: Role.Admin,
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
      username: user.username,
      email: user.email,
      isActive: user.isActive,
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
      provider: Provider.GG,
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
      if (user && user.provider !== Provider.GitHub) {
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
      provider: Provider.GitHub,
      verified: true,
      providerId: githubUser.providerId,
    });
  }
}
