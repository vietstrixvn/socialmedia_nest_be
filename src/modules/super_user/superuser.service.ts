import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
import { buildCacheKey } from '../../utils/cache-key.util';
import { RedisCacheService } from '../cache/redis-cache.service';
import { Pagination } from '../paginate/pagination';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type {
  UserData,
  UserDataResponse,
  UserResponse,
} from './responses/user.interface';
import { UserError, UserSuccess } from './superuser.constant';
// import { EmailPasswordService } from 'src/services/email_password.service';
import { randomBytes } from 'crypto';
import {
  SuperUserDocument,
  SuperUserEntity,
} from 'src/entities/super.user.entity';
import { toDataResponse } from '../../mappers/superuser.mapper';
import { AdminListData } from './interfaces/list.reponse';
import { VerificationCode } from './interfaces/verification-code.interface';

@Injectable()
export class SuperUserService {
  private readonly logger = new Logger(SuperUserService.name);
  private verificationCodes: Map<
    string,
    VerificationCode & { newPassword: string }
  > = new Map();

  constructor(
    @InjectModel(SuperUserEntity.name)
    private readonly userModel: Model<SuperUserDocument>,
    private readonly redisCacheService: RedisCacheService,
    // private readonly emailPasswordService: EmailPasswordService,
  ) {}

  async getAllUsers(
    startDate?: string,
    endDate?: string,
    searchQuery?: string,
    page: number = 1,
    page_size: number = 10,
  ): Promise<Pagination<AdminListData>> {
    const cacheKey = buildCacheKey('users', {
      page,
      page_size,
      start: startDate,
      end: endDate,
      search: searchQuery || '',
    });

    const cached =
      await this.redisCacheService.get<
        Pagination<Omit<SuperUserEntity, 'password'>>
      >(cacheKey);

    // if (cached) {
    //   // this.logger.log(`Cache HIT: ${cacheKey}`);
    //   return cached;
    // }

    const filter: any = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (searchQuery) {
      filter.$or = [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { phone_number: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const users = await this.userModel
      .find(filter)
      .select(
        '_id firstName lastName username email phone_number isActive  permissions role  account_type createdAt updatedAt',
      )
      .skip((page - 1) * page_size)
      .limit(page_size)
      .lean();

    const total = await this.userModel.countDocuments(filter);

    const results = users.map((user: any) => {
      const mappedUser = toDataResponse(user);
      const { password, ...userWithoutPassword } = mappedUser;

      return {
        ...userWithoutPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        permissions: user.permissions,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    });

    const result = new Pagination<AdminListData>({
      results,
      total,
      total_page: Math.ceil(total / page_size),
      page_size: page_size,
      current_page: page,
    });

    await this.redisCacheService.set(cacheKey, result, 3600).catch(() => null);
    return result;
  }

  async createManagerUser(
    createManagerDto: CreateManagerDto,
    user: UserData,
  ): Promise<UserResponse> {
    const { username, password, email, phone_number, firstName, lastName } =
      createManagerDto;

    // Check tồn tại user
    const existingUser = await this.userModel.findOne({ email, username });
    if (existingUser) {
      throw new BadRequestException(UserError.ThisEmailAlreadyExists);
    }

    const newUser = new this.userModel({
      username,
      password,
      email,
      phone_number,
      firstName,
      lastName,
      role: Role.Manager,
      data: {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
    });

    // Gửi email và reset Redis song song
    try {
      await Promise.all([this.redisCacheService.reset()]);
    } catch (error) {
      this.logger.error(
        'Failed to send registration email or reset Redis:',
        error,
      );
      // Continue with the response even if email fails or Redis reset fails
    }

    const savedUser = await newUser.save();

    return {
      status: 201,
      message: UserSuccess.UserCreated,
      data: {
        _id: savedUser._id,
        fristName: savedUser.firstName,
        lastName: savedUser.lastName,
        username: savedUser.username,
        role: savedUser.role,
        email: savedUser.email,
        phone_number: savedUser.phone_number,
      },
    };
  }

  async updateHashedRefreshToken(
    _id: string,
    hashedRefreshToken: string | null,
  ) {
    return await this.userModel.updateOne(
      { _id },
      { $set: { hashedRefreshToken } },
    );
  }

  async getUserStatistic() {
    const totalUsers = await this.userModel.countDocuments();

    const roleCounts = await this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const countsByRole = roleCounts.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalUsers,
      ...countsByRole,
    };
  }

  async getTotalCountOfEachStatus(): Promise<Record<string, number>> {
    const counts = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return counts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});
  }

  async findByUsernameOrEmail(
    identifier: string,
  ): Promise<SuperUserEntity | null> {
    const normalized = identifier.trim().toLowerCase();
    return this.userModel.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    });
  }

  async findOne(_id: string) {
    if (!_id) {
      this.logger.warn('findOne called with undefined or null _id');
      return null;
    }
    const user = await this.userModel
      .findOne({ _id })
      .select(
        '_id username email isActive role permissions firstName lastName',
      );

    return user;
  }

  async findByUuid(_id: string): Promise<UserDataResponse | null> {
    // Create cache key using only the user ID
    const cacheKey = buildCacheKey('user', { id: _id });

    // Try to get from cache first
    const cached = await this.redisCacheService.get<UserDataResponse>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    // If not in cache, get from database
    const user = await this.userModel.findById(_id).lean();
    if (!user) {
      return null;
    }

    // Map to response format
    const response = toDataResponse(user);

    // Create a properly typed UserResponse object
    const userResponse: UserDataResponse = {
      status: 200,
      message: 'User found successfully',
      data: {
        _id: response._id,
        fristName: response.fristName,
        lastName: response.lastName,
        username: response.username,
        role: response.role,
        email: response.email,
        phone_number: response.phone_number,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      },
    };

    // Save to cache for 1 hour (3600 seconds)
    await this.redisCacheService
      .set(cacheKey, userResponse, 3600)
      .catch((err) => this.logger.error('Cache set failed:', err));

    return userResponse;
  }

  async deleteManagerById(
    userId: string,
  ): Promise<{ status: string; message: string }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException(UserError.UserNotFound || 'User not found');
    }

    if (user.role !== Role.Manager) {
      throw new BadRequestException(UserError.RoleError);
    }

    await this.userModel.findByIdAndDelete(userId);

    await this.redisCacheService.reset();

    return {
      status: 'success',
      message: 'Manager deleted successfully',
    };
  }

  async initiatePasswordChange(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<{ status: string; message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(UserError.UserNotFound);
    }

    const isValidPassword = await user.comparePassword(dto.currentPassword);
    if (!isValidPassword) {
      throw new BadRequestException(UserError.CurrentIncorrect);
    }

    const verificationCode = randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    this.verificationCodes.set(userId, {
      code: verificationCode,
      expiresAt,
      newPassword: dto.newPassword,
    });

    // Gửi email bất đồng bộ, phản hồi API ngay
    // setImmediate(() => {
    //   this.emailPasswordService
    //     .sendMail({
    //       recipientEmail: user.email,
    //       verificationCode,
    //     })
    //     .catch((error) => {
    //       this.logger.error(`Email sent failed to ${user.email}:`, error);
    //     });
    // });

    return {
      status: 'success',
      message: UserSuccess.VerificationSent,
    };
  }

  async verifyCodeAndUpdatePassword(
    userId: string,
    code: string,
  ): Promise<{ status: string; message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(UserError.UserNotFound);
    }

    const storedVerification = this.verificationCodes.get(userId);

    if (!storedVerification) {
      throw new BadRequestException(UserError.NoVerificationCode);
    }

    if (new Date() > storedVerification.expiresAt) {
      this.verificationCodes.delete(userId);
      throw new BadRequestException(UserError.VerificationExpired);
    }

    if (storedVerification.code !== code.toUpperCase()) {
      throw new BadRequestException(UserError.InvalidVerification);
    }

    // Get the stored password change request
    const passwordChangeRequest = this.verificationCodes.get(userId);
    if (!passwordChangeRequest) {
      throw new BadRequestException(UserError.PasswordNotFound);
    }

    try {
      // Update password
      user.password = passwordChangeRequest.newPassword;
      await user.save();

      // Clear verification code
      this.verificationCodes.delete(userId);

      // Invalidate user cache
      const cacheKey = buildCacheKey('user', { id: userId });
      await this.redisCacheService.del(cacheKey).catch(() => null);

      return {
        status: 'success',
        message: UserSuccess.PasswordUpdated,
      };
    } catch (error) {
      this.logger.error('Failed to update password:', error);
      throw new BadRequestException(UserError.FailedUpdatePassword);
    }
  }
}
