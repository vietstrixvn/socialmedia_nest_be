import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserRole } from 'src/common';
import {
  UserPropertyDocument,
  UserPropertyEntity,
} from 'src/entities/user_properties.entity';
import { toUserPropertyDataResponse } from 'src/mappers/user-property.mapper';
import { Pagination } from '../paginate/pagination';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';
import { UserService } from '../user/user.service';
import { AddMemberDto } from './dtos/add-member.dto';
import { UserPropertyResponse } from './reponses/data.response';

@Injectable()
export class UserPropertyService {
  private readonly logger = new Logger(UserPropertyService.name);

  constructor(
    @InjectModel(UserPropertyEntity.name)
    private readonly userPropertyModel: Model<UserPropertyDocument>,
    // private readonly redisCacheService: RedisCacheService,

    private readonly userService: UserService,
    // private readonly propertyService: PropertyService,
  ) {}

  async assignOwner(userId: string, propertyId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BadRequestException('User not found');

    return this.userPropertyModel.create({
      userId: user._id,
      propertyId,
      role: UserRole.Owner,
      joinedAt: new Date(),
      isActive: true,
      permissions: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
      },
    });
  }

  async findPropertiesByOwner(
    userId: string,
    options: PaginationOptionsInterface,
  ): Promise<Pagination<UserPropertyResponse>> {
    const filter = { userId, isActive: true };

    const properties = await this.userPropertyModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .populate({
        path: 'propertyId', // chính xác: populate propertyId
        populate: {
          path: 'owner', // bây giờ owner là virtual trên property
          populate: {
            path: 'userId',
            select: 'firstName lastName email username',
          },
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.userPropertyModel.countDocuments(filter);

    const mappedProperties = properties.map(toUserPropertyDataResponse);

    return new Pagination<UserPropertyResponse>({
      results: mappedProperties,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });
  }

  async findAllUserProperties(
    userId: string,
    options: PaginationOptionsInterface,
  ): Promise<Pagination<UserPropertyResponse>> {
    const filter = { userId, isActive: true };

    const properties = await this.userPropertyModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .populate({
        path: 'propertyId',
        populate: ['owner', 'members', 'memberCount', 'postCount'],
      })
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.userPropertyModel.countDocuments(filter);

    const mappedProperties = properties.map(toUserPropertyDataResponse);

    return new Pagination<UserPropertyResponse>({
      results: mappedProperties,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });
  }

  async findPropertiesByMember(
    userId: string,
    options: PaginationOptionsInterface,
  ): Promise<Pagination<UserPropertyResponse>> {
    const filter = { userId, isActive: true };

    const properties = await this.userPropertyModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .populate({
        path: 'propertyId',
        populate: {
          path: 'member',
          populate: {
            path: 'userId',
            select: 'firstName lastName email username',
          },
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.userPropertyModel.countDocuments(filter);

    const mappedProperties = properties.map(toUserPropertyDataResponse);

    return new Pagination<UserPropertyResponse>({
      results: mappedProperties,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });
  }

  async validateUserInProperty(
    userId: string,
    propertyId: string,
  ): Promise<boolean> {
    const exists = await this.userPropertyModel.exists({
      userId,
      propertyId,
      isActive: true,
    });

    return !!exists;
  }

  async getUserProperty(
    userId: string,
    propertyId: string,
  ): Promise<UserPropertyDocument | null> {
    return this.userPropertyModel.findOne({
      userId,
      propertyId,
      isActive: true,
    });
  }

  async addMember(ownerId: string, dto: AddMemberDto) {
    const { userId, propertyId } = dto;

    const ownerProperty = await this.userPropertyModel.findOne({
      userId: ownerId,
      propertyId,
      isActive: true,
    });

    if (!ownerProperty || ownerProperty.role !== UserRole.Owner) {
      throw new BadRequestException(
        'Only owner can add members to this property',
      );
    }

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const exists = await this.userPropertyModel.findOne({ userId, propertyId });
    if (exists) {
      throw new BadRequestException('User already a member of this property');
    }

    const newMember = await this.userPropertyModel.create({
      userId: user._id,
      propertyId,
      role: UserRole.Member,
      joinedAt: new Date(),
      isActive: true,
      permissions: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
      },
    });

    return newMember;
  }
}
