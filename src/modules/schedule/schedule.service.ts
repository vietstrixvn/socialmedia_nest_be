import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RedisCacheService } from '../cache/redis-cache.service';

import { StatusCode, StatusType } from 'src/common';
import { ScheduleDocument, ScheduleEntity } from 'src/entities/schedule.entity';
import { buildScheduleFilter } from 'src/helpers/schedule.helper';
import { toScheduleDataResponse } from 'src/mappers/schedule.mapper';
import { buildCacheKey } from 'src/utils/cache-key.util';
import { Pagination } from '../paginate/pagination';
import {
  GraphPagination,
  PaginationOptionsInterface,
} from '../paginate/pagination.options.interface';
import { PlatformService } from '../platform/platform.service';
import { PostService } from '../post/post.service';
import { PublishStatus } from '../post/responses/data.response';
import { PropertyService } from '../property/property.service';
import { UserLiteData } from '../user/responeses/user.response';
import { CreateScheduleDto } from './dtos/create.dto';
import { CreateScheduleResponse } from './responses/create.response';
import { ScheduleResponse } from './responses/data.response';
import { SCHEDULE_CACHE_TTL } from './schedule.constant';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(ScheduleEntity.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    private readonly postService: PostService,
    private readonly propertyService: PropertyService,
    private readonly platformService: PlatformService,

    private readonly redisCacheService: RedisCacheService,
  ) {}

  async graphFindByPost(
    options: PaginationOptionsInterface,
    postId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<GraphPagination<ScheduleResponse>> {
    const cacheKey = buildCacheKey('schedules_by_post', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
      postID: postId,
    });

    const cached =
      await this.redisCacheService.get<GraphPagination<ScheduleResponse>>(
        cacheKey,
      );

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = {
      ...buildScheduleFilter({ startDate, endDate }),
      post_id: postId,
    };

    const properties = await this.scheduleModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.scheduleModel.countDocuments(filter);

    const mappedProperties = properties.map(toScheduleDataResponse);

    const result = new GraphPagination<ScheduleResponse>({
      items: mappedProperties,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      SCHEDULE_CACHE_TTL.SCHEDULE_LIST,
    );
    return result;
  }

  async graphFindByProperty(
    options: PaginationOptionsInterface,
    propertyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<GraphPagination<ScheduleResponse>> {
    const cacheKey = buildCacheKey('schedules_by_property', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
      propertyID: propertyId,
    });

    const cached =
      await this.redisCacheService.get<GraphPagination<ScheduleResponse>>(
        cacheKey,
      );

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const property = await this.propertyService.validateProperty(propertyId);
    if (!property) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: 'Not Found or Not Allowed',
        error: 'Not Found',
      });
    }

    // 1. Build filter trực tiếp trên Schedule
    const filter: any = {
      ...buildScheduleFilter({ startDate, endDate }),
      propertyId, // vì giờ schedule đã có propertyId
    };

    // 2. Query schedules
    const schedules = await this.scheduleModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.scheduleModel.countDocuments(filter);

    const mappedSchedules = schedules.map(toScheduleDataResponse);

    const result = new GraphPagination<ScheduleResponse>({
      items: mappedSchedules,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    // 3. Cache lại
    await this.redisCacheService.set(
      cacheKey,
      result,
      SCHEDULE_CACHE_TTL.SCHEDULE_LIST,
    );

    return result;
  }

  async findByPost(
    options: PaginationOptionsInterface,
    postId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Pagination<ScheduleResponse>> {
    const cacheKey = buildCacheKey('schedules_by_post', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
      postID: postId,
    });

    const cached =
      await this.redisCacheService.get<Pagination<ScheduleResponse>>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = {
      ...buildScheduleFilter({ startDate, endDate }),
      post_id: postId,
    };

    const properties = await this.scheduleModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.scheduleModel.countDocuments(filter);

    const mappedProperties = properties.map(toScheduleDataResponse);

    const result = new Pagination<ScheduleResponse>({
      results: mappedProperties,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      SCHEDULE_CACHE_TTL.SCHEDULE_LIST,
    );
    return result;
  }

  async findByProperty(
    options: PaginationOptionsInterface,
    propertyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Pagination<ScheduleResponse>> {
    const cacheKey = buildCacheKey('schedules_by_property', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
      propertyID: propertyId,
    });

    const cached =
      await this.redisCacheService.get<Pagination<ScheduleResponse>>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const property = await this.propertyService.validateProperty(propertyId);
    if (!property) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: 'Not Found or Not Allowed',
        error: 'Not Found',
      });
    }

    // 1. Build filter trực tiếp trên Schedule
    const filter: any = {
      ...buildScheduleFilter({ startDate, endDate }),
      propertyId, // vì giờ schedule đã có propertyId
    };

    // 2. Query schedules
    const schedules = await this.scheduleModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.scheduleModel.countDocuments(filter);

    const mappedSchedules = schedules.map(toScheduleDataResponse);

    const result = new Pagination<ScheduleResponse>({
      results: mappedSchedules,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    // 3. Cache lại
    await this.redisCacheService.set(
      cacheKey,
      result,
      SCHEDULE_CACHE_TTL.SCHEDULE_LIST,
    );

    return result;
  }

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

    const isValidPlatform =
      await this.platformService.validateLimitPlarform(platform_id);
    if (!isValidPlatform) {
      throw new BadRequestException({
        message: 'One or more platforms do not exist',
        code: StatusCode.BadRequest,
      });
    }

    // Optional: validate credential if provided
    // let credentialDoc: CredentialDocument | null = null;
    // if (credential_id) {
    //   credentialDoc = await this.credentialModel.findById(credential_id);
    //   if (!credentialDoc)
    //     throw new BadRequestException({ message: 'Credential not found' });
    // }

    // Check if post exists & lấy propertyId
    const postDoc = await this.postService.findById(post_id);
    if (!postDoc) {
      throw new BadRequestException({ message: 'Post not found or invalid' });
    }

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
      propertyId: postDoc.propertyId,
      status: PublishStatus.PENDING, // default
    });

    try {
      const saved = await newSchedule.save();
      await this.redisCacheService.delByPattern('schedules_by_property*');

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
