import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RedisCacheService } from '../cache/redis-cache.service';

import { StatusType } from 'src/common';
import { ScheduleDocument, ScheduleEntity } from 'src/entities/schedule.entity';
import { PostService } from '../post/post.service';
import { PublishStatus } from '../post/responses/data.response';
import { UserLiteData } from '../user/responeses/user.response';
import { CreateScheduleDto } from './dtos/create.dto';
import { CreateScheduleResponse } from './responses/create.response';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(ScheduleEntity.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    private readonly postService: PostService,

    private readonly redisCacheService: RedisCacheService,
  ) {}

  //   async findAll(
  //     options: PaginationOptionsInterface,
  //     ownerId: string,
  //     startDate?: string,
  //     endDate?: string,
  //   ): Promise<Pagination<SchduleResponse>> {
  //     const cacheKey = buildCacheKey('properties', {
  //       page: options.page,
  //       page_size: options.page_size,
  //       start: startDate,
  //       end: endDate,
  //       owner: ownerId,
  //     });

  //     const cached =
  //       await this.redisCacheService.get<Pagination<PropertyResponse>>(cacheKey);

  //     if (cached) {
  //       this.logger.log(`Cache HIT: ${cacheKey}`);
  //       return cached;
  //     }

  //     const filter = {
  //       ...buildPropertyFilter({ startDate, endDate }),
  //       owner: ownerId,
  //     };
  // async findAll(
  //     options: PaginationOptionsInterface,
  //     ownerId: string,
  //     startDate?: string,
  //     endDate?: string,
  //   ): Promise<Pagination<SchduleResponse>> {
  //     const cacheKey = buildCacheKey('properties', {
  //       page: options.page,
  //       page_size: options.page_size,
  //       start: startDate,
  //       end: endDate,
  //       owner: ownerId,
  //     });

  //     const cached =
  //       await this.redisCacheService.get<Pagination<PropertyResponse>>(cacheKey);

  //     if (cached) {
  //       this.logger.log(`Cache HIT: ${cacheKey}`);
  //       return cached;
  //     }

  //     const filter = {
  //       ...buildPropertyFilter({ startDate, endDate }),
  //       owner: ownerId,
  //     };

  //     const properties = await this.propertyModel
  //       .find(filter)
  //       .skip((options.page - 1) * options.page_size)
  //       .populate({
  //         path: 'platforms',
  //         select: '_id name',
  //       })

  //       .populate('owner')

  //       .limit(options.page_size)
  //       .sort({ createdAt: -1 })
  //       .exec();

  //     const total = await this.propertyModel.countDocuments(filter);

  //     const mappedProperties = properties.map(toPropertyDataResponse);

  //     const result = new Pagination<PropertyResponse>({
  //       results: mappedProperties,
  //       total,
  //       total_page: Math.ceil(total / options.page_size),
  //       page_size: options.page_size,
  //       current_page: options.page,
  //     });

  //     await this.redisCacheService.set(
  //       cacheKey,
  //       result,
  //       PROPERTY_CACHE_TTL.PROPERTY_LIST,
  //     );
  //     return result;
  //   }
  //     const properties = await this.propertyModel
  //       .find(filter)
  //       .skip((options.page - 1) * options.page_size)
  //       .populate({
  //         path: 'platforms',
  //         select: '_id name',
  //       })

  //       .populate('owner')

  //       .limit(options.page_size)
  //       .sort({ createdAt: -1 })
  //       .exec();

  //     const total = await this.propertyModel.countDocuments(filter);

  //     const mappedProperties = properties.map(toPropertyDataResponse);

  //     const result = new Pagination<PropertyResponse>({
  //       results: mappedProperties,
  //       total,
  //       total_page: Math.ceil(total / options.page_size),
  //       page_size: options.page_size,
  //       current_page: options.page,
  //     });

  //     await this.redisCacheService.set(
  //       cacheKey,
  //       result,
  //       PROPERTY_CACHE_TTL.PROPERTY_LIST,
  //     );
  //     return result;
  //   }

  //   async adminFindAll(
  //     options: PaginationOptionsInterface,
  //     startDate?: string,
  //     ownerId?: string,
  //     endDate?: string,
  //   ): Promise<Pagination<PropertyResponse>> {
  //     const cacheKey = buildCacheKey('admin_properties', {
  //       page: options.page,
  //       page_size: options.page_size,
  //       start: startDate,
  //       end: endDate,
  //       owner: ownerId,
  //     });

  //     const cached =
  //       await this.redisCacheService.get<Pagination<PropertyResponse>>(cacheKey);

  //     if (cached) {
  //       this.logger.log(`Cache HIT: ${cacheKey}`);
  //       return cached;
  //     }

  //     // ✨ Build filter with optional ownerId
  //     const filter = {
  //       ...buildPropertyFilter({ startDate, endDate }),
  //       // Add owner filter only if ownerId is provided
  //       ...(ownerId && {
  //         $or: [
  //           { 'owner.id': ownerId },
  //           { 'owner._id': ownerId },
  //           { owner: ownerId },
  //         ],
  //       }),
  //     };

  //     const properties = await this.propertyModel
  //       .find(filter)
  //       .skip((options.page - 1) * options.page_size)
  //       .populate({
  //         path: 'platforms',
  //         select: '_id name',
  //       })
  //       .limit(options.page_size)
  //       .sort({ createdAt: -1 })
  //       .exec();

  //     const total = await this.propertyModel.countDocuments(filter);

  //     const mappedProperties = properties.map(toPropertyDataResponse);

  //     const result = new Pagination<PropertyResponse>({
  //       results: mappedProperties,
  //       total,
  //       total_page: Math.ceil(total / options.page_size),
  //       page_size: options.page_size,
  //       current_page: options.page,
  //     });

  //     await this.redisCacheService.set(
  //       cacheKey,
  //       result,
  //       PROPERTY_CACHE_TTL.PROPERTY_LIST,
  //     );
  //     return result;
  //   }

  async create(
    createScheduleDto: CreateScheduleDto,
    user: UserLiteData,
  ): Promise<CreateScheduleResponse> {
    const { post_id, platform_id, credential_id, scheduled_at } =
      createScheduleDto;

    // Validate required fields
    if (!post_id || !platform_id || !scheduled_at) {
      throw new BadRequestException({
        message: 'post_id, platform_id and scheduled_at are required',
      });
    }
    // Check if post exists
    const isValidPost = await this.postService.validatePost(post_id);
    if (!isValidPost) {
      throw new BadRequestException({ message: 'Post not found or invalid' });
    }

    // Optional: validate credential if provided
    // let credentialDoc: CredentialDocument | null = null;
    // if (credential_id) {
    //   credentialDoc = await this.credentialModel.findById(credential_id);
    //   if (!credentialDoc)
    //     throw new BadRequestException({ message: 'Credential not found' });
    // }

    // Check if a schedule for this post + platform already exists
    const existingSchedule = await this.scheduleModel.findOne({
      post_id,
      platform_id,
    });

    if (existingSchedule) {
      throw new BadRequestException({
        message: 'Schedule for this post and platform already exists',
      });
    }

    // Create schedule
    const newSchedule = new this.scheduleModel({
      post_id,
      platform_id,
      credential_id: credential_id || null,
      scheduled_at,
      created_by: user.id,
      status: PublishStatus.PENDING, // default
    });

    try {
      const saved = await newSchedule.save();
      return {
        status: StatusType.Success,
        result: saved,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException({ message: 'Duplicate schedule' });
      }
      throw err;
    }
  }
}
