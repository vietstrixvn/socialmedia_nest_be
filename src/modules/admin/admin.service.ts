import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';

// Components
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from 'src/configs/refresh-jwt.config';
import { SuperUserDocument, SuperUserEntity } from 'src/entities';
import { generateTokens } from 'src/middlewares/generateTokens.middleware';
import { Role } from '../../common/enums/role.enum';
import { SuperUserService } from '../super_user/superuser.service';
import { AuthError } from './admin.constant';
import { LogInDTO } from './dtos/log-in.dto';
import { LogInResponse } from './responses/log-in.response';
import { CurrentAdmin } from './types/current-admin';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(SuperUserEntity.name)
    private readonly superUserModel: Model<SuperUserDocument>,

    private readonly superuserService: SuperUserService,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async onModuleInit() {
    await this.createAdminAccount();
  }

  async validateAdmin(email: string, password: string) {
    const user = await this.superuserService.findByUsernameOrEmail(email);
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

  private async createAdminAccount() {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');

    try {
      const existingAdmin = await this.superUserModel.findOne(
        { username: adminUsername },
        '_id',
      );

      if (existingAdmin?._id) {
        return;
      }

      if (existingAdmin) {
        this.logger.warn('Found admin account with null ID, removing...');
        await this.superUserModel.deleteOne({ username: adminUsername });
      }

      const adminPayload = {
        username: this.configService.get<string>('ADMIN_USERNAME'),
        password: this.configService.get<string>('ADMIN_PASSWORD'),
        email: this.configService.get<string>('ADMIN_EMAIL'),
        firstName: this.configService.get<string>('ADMIN_FRIST_NAME'),
        lastName: this.configService.get<string>('ADMIN_LAST_NAME'),
        phone_number: this.configService.get<string>('ADMIN_PHONE'),
        role: Role.Admin,
        verified: true,
      };
      const admin = new this.superUserModel(adminPayload);

      const savedAdmin = await admin.save();
      this.logger.log(
        `[SUCCESS]  Admin created successfully with ID: ${savedAdmin._id}`,
      );
    } catch (error) {
      this.logger.error('Admin account creation failed:', error);
      throw error;
    }
  }

  async validateAttemptAndSignToken(dto: LogInDTO): Promise<LogInResponse> {
    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException(AuthError.PasswordRequired);
    }

    const user = (await this.superUserModel.findOne({
      $or: [{ username: dto.username }, { email: dto.username }],
    })) as SuperUserDocument | null;

    const isValidPassword = user
      ? await user.comparePassword(dto.password)
      : false;

    if (!user || !isValidPassword) {
      throw new BadRequestException(AuthError.InvalidLoginCredentials);
    }

    if (![Role.Admin, Role.Manager].includes(user.role)) {
      throw new BadRequestException(AuthError.AccessDenied);
    }

    const { accessToken, refreshToken } = await generateTokens(
      user._id.toString(),
      this.jwtService,
      this.refreshTokenConfig,
    );

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.superuserService.updateHashedRefreshToken(
      user._id.toString(),
      hashedRefreshToken,
    );

    return {
      _id: user._id.toString(),
      accessToken,
      refreshToken,
    };
  }

  async validateUserAndGetRole(_id: string): Promise<string> {
    const user = await this.superuserService.findOne(_id);
    if (!user?.role) {
      throw new BadRequestException(AuthError.UserRole);
    }
    return user.role;
  }

  async validateJwtAdmin(_id: string) {
    if (!_id) {
      this.logger.warn('validateJwtAdmin called with empty _id');
      throw new UnauthorizedException('Invalid user id');
    }
    const admin = (await this.superuserService.findOne(
      _id,
    )) as SuperUserDocument;

    if (!admin) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentAdmin = {
      id: admin._id.toString(),
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      isActive: admin.isActive,
      role: admin.role,
      permissions: admin.permissions,
    };
    return currentUser;
  }

  async refreshToken(_id: string) {
    const { accessToken, refreshToken } = await generateTokens(
      _id,
      this.jwtService,
      this.refreshTokenConfig,
    );

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.superuserService.updateHashedRefreshToken(
      _id,
      hashedRefreshToken,
    );

    return {
      id: _id,
      accessToken,
      refreshToken,
    };
  }

  async signOut(_id: string) {
    await this.superuserService.updateHashedRefreshToken(_id, null);
  }
}
