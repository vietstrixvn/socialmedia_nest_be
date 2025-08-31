import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserEntity } from 'src/entities/user.entity';
import { UserDataResponse } from 'src/mappers/user.mapper';
import { EmailService } from 'src/services/email.service';
import { buildCacheKey } from 'src/utils/cache-key.util';
import { RedisCacheService } from '../cache/redis-cache.service';
import { Pagination } from '../paginate/pagination';
import {
  CreateUserGithubDto,
  CreateUserGoogleDto,
  CreateUserLocalDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListData } from './responeses/list.reponse';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    private readonly redisCacheService: RedisCacheService,
    private readonly emailService: EmailService,

    // private readonly emailPasswordService: EmailPasswordService,
  ) {}

  async updateHashedRefreshToken(
    _id: string,
    hashedRefreshToken: string | null,
  ) {
    return await this.userModel.updateOne(
      { _id },
      { $set: { hashedRefreshToken } },
    );
  }

  async create(createUserDto: CreateUserLocalDto) {
    const user = new this.userModel({
      ...createUserDto,
      verified: false,
    });

    try {
      await Promise.all([
        this.emailService.sendEmail({
          recipientEmail: createUserDto.email,
          name: createUserDto.firstName,
        }),
        // this.redisCacheService.delByPattern('register*'),
      ]);
    } catch (error) {
      // Xử lý lỗi gửi email hoặc reset Redis nếu cần thiết
      console.error('Error occurred during async operations', error);
    }

    return await user.save();
  }

  async ggCreate(createUserDto: CreateUserGoogleDto) {
    const user = new this.userModel(createUserDto);

    try {
      await Promise.all([
        this.emailService.sendEmail({
          recipientEmail: createUserDto.email,
          name: createUserDto.firstName,
        }),
        // this.redisCacheService.delByPattern('register*'),
      ]);
    } catch (error) {
      // Xử lý lỗi gửi email hoặc reset Redis nếu cần thiết
      console.error('Error occurred during async operations', error);
    }
    return await user.save();
  }

  async ghCreate(createUserDto: CreateUserGithubDto) {
    const user = new this.userModel({
      ...createUserDto,
      // Nếu email trống thì gán tạm string ngẫu nhiên tránh trùng key (nếu cần unique)
      email:
        createUserDto.email ??
        `no-email-${createUserDto.providerId}@github.local`,
    });

    return await user.save();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({
      where: {
        email,
      },
    });
  }

  async findByProviderId(providerId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ providerId }).exec();
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(_id: string) {
    return this.userModel
      .findOne({ _id })
      .select(
        '_id firstName lastName avatarUrl hashedRefreshToken  isActive isBlocked username email',
      );
  }

  update(_id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${_id} user`;
  }

  remove(_id: string) {
    return `This action removes a #${_id} user`;
  }

  async addOwnedProperty(userId: string, propertyId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { owned_properties: propertyId } },
    );
  }

  async removeOwnedProperty(userId: string, propertyId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { owned_properties: propertyId } },
      { new: true },
    );
  }

  async getAllUsers(
    startDate?: string,
    endDate?: string,
    searchQuery?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Pagination<UserListData>> {
    const cacheKey = buildCacheKey('users', {
      page,
      limit,
      start: startDate,
      end: endDate,
      search: searchQuery || '',
    });

    const cached =
      await this.redisCacheService.get<
        Pagination<Omit<UserEntity, 'password'>>
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
        '_id firstName lastName username email phone_number isActive isBlocked provider providerId account_type createdAt updatedAt avatarUrl',
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await this.userModel.countDocuments(filter);

    const results = users.map((user: any) => {
      const mappedUser = UserDataResponse(user);
      const { password, ...userWithoutPassword } = mappedUser;

      return {
        ...userWithoutPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        isBlocked: user.isBlocked,
        provider: user.provider,
        providerId: user.providerId,
        account_type: user.iaccount_typesBlocked,
        lastLogin: user.lastLogin,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    });

    const result = new Pagination<UserListData>({
      results,
      total,
      total_page: Math.ceil(total / limit),
      page_size: limit,
      current_page: page,
    });

    await this.redisCacheService.set(cacheKey, result, 3600).catch(() => null);
    return result;
  }
}
