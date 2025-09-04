import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RedisCacheService } from '../cache/redis-cache.service';

import { StatusCode, StatusType } from 'src/common';
import { PostDocument, PostEntity } from 'src/entities/post.entity';
import { buildPostFilter } from 'src/helpers/post.helper';
import { toPostResponse } from 'src/mappers/post.mapper';
import { buildCacheKey } from 'src/utils/cache-key.util';
import { Pagination } from '../paginate/pagination';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';
import { PlatformService } from '../platform/platform.service';
import { PropertyService } from '../property/property.service';
import { UserLiteData } from '../user/responeses/user.response';
import { CreatePostDto } from './dtos/create.dto';
import { POST_CACHE_TTL } from './post.constant';
import { CreatePostResponse } from './responses/create.response';
import { PostResponse, PublishStatus } from './responses/data.response';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectModel(PostEntity.name)
    private readonly postModel: Model<PostDocument>,
    private readonly redisCacheService: RedisCacheService,
    private readonly propertyService: PropertyService,

    private readonly platformService: PlatformService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    user: UserLiteData,
  ): Promise<CreatePostResponse> {
    const { text, media_urls, platforms, schedules, propertyId } =
      createPostDto;

    if (!platforms || platforms.length === 0) {
      throw new BadRequestException({
        message: 'At least one platform is required',
        code: StatusCode.BadRequest,
      });
    }

    // Validate platforms có tồn tại
    const isValidPlatform =
      await this.platformService.validateFlatform(platforms);
    if (!isValidPlatform) {
      throw new BadRequestException({
        message: 'One or more platforms do not exist',
        code: StatusCode.BadRequest,
      });
    }

    // Init publishResults cho từng platform
    const publishResults = platforms.map((platformId) => ({
      platform: platformId,
      status: PublishStatus.PENDING,
      retryCount: 0,
    }));

    const newPost = new this.postModel({
      text,
      media_urls: media_urls ?? [],
      schedules: schedules ?? [],
      created_by: user.id,
      publishResults,
      propertyId,
    });

    try {
      const saved = await newPost.save();

      await this.redisCacheService.delByPattern('posts*');

      return {
        status: StatusType.Success,
        result: saved,
      };
    } catch (err: any) {
      throw new BadRequestException({
        message: err.message || 'Failed to create post',
      });
    }
  }

  async findAll(
    options: PaginationOptionsInterface,
    startDate?: string,
    endDate?: string,
  ): Promise<Pagination<PostResponse>> {
    const cacheKey = buildCacheKey('posts', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
    });

    const cached =
      await this.redisCacheService.get<Pagination<PostResponse>>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = {
      ...buildPostFilter({ startDate, endDate }),
    };

    const properties = await this.postModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .populate({
        path: 'platforms',
        select: '_id name',
      })
      .limit(options.page_size)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.postModel.countDocuments(filter);

    const mappedProperties = properties.map(toPostResponse);

    const result = new Pagination<PostResponse>({
      results: mappedProperties,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      POST_CACHE_TTL.POST_LIST,
    );
    return result;
  }

  async findByProperty(
    options: PaginationOptionsInterface,
    propertyId: string,
  ): Promise<Pagination<PostResponse>> {
    const cacheKey = `posts_property${propertyId}`;
    const cached =
      await this.redisCacheService.get<Pagination<PostResponse>>(cacheKey);

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

    const posts = await this.postModel.find({ propertyId });

    const filter: any = {
      propertyId, // vì giờ schedule đã có propertyId
    };

    // .populate({ path: 'schedules', select: '_id scheduled_at' })
    //
    const total = await this.postModel.countDocuments(filter);
    const mappedPosts = posts.map(toPostResponse);

    const result = new Pagination<PostResponse>({
      results: mappedPosts,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService
      .set(cacheKey, result, 3600)
      .catch((err) => this.logger.error(`Failed to cache ${cacheKey}`, err));

    return result;
  }

  async validatePost(postId: string): Promise<boolean> {
    try {
      const service = await this.postModel.findById(postId).exec();
      return !!service; // Returns true if service exists, false otherwise
    } catch (error) {
      this.logger.error(`Error validating post: ${error.message}`);
      return false;
    }
  }

  async findPostIdsByProperty(propertyId: string): Promise<string[]> {
    const posts = await this.postModel
      .find({ propertyId })
      .select('_id')
      .lean()
      .exec();

    return posts.map((p) => p._id.toString());
  }

  async findById(postId: string): Promise<PostDocument | null> {
    try {
      return await this.postModel.findById(postId).exec();
    } catch (error) {
      this.logger.error(`Error finding post: ${error.message}`);
      return null;
    }
  }

  // async findByProperty(id: string, propertyId: string): Promise<PostResponse> {
  //   const cacheKey = `property_${id}_${propertyId}`;
  //   const cached = await this.redisCacheService.get<PostResponse>(cacheKey);

  //   if (cached) {
  //     this.logger.log(`Cache HIT: ${cacheKey}`);
  //     return cached;
  //   }

  //   const propoerty = await this.propertyService.validateProperty(propertyId);
  //   if (!propoerty) {
  //     throw new BadRequestException({
  //       statusCode: StatusCode.BadRequest,
  //       message: 'Not Found or Not Allowed',
  //       error: 'Not Found',
  //     });
  //   }

  //   const post = await this.postModel
  //     .findOne({ _id: id, propertyId })
  //     .populate({
  //       path: 'schedules',
  //       select: '_id scheduled_at',
  //     });

  //   if (!post)
  //     throw new BadRequestException({
  //       statusCode: StatusCode.BadRequest,
  //       message: 'Not Found or Not Allowed',
  //       error: 'Not Found',
  //     });

  //   const result = toPostResponse(post);

  //   await this.redisCacheService
  //     .set(cacheKey, result, 3600)
  //     .catch((err) => this.logger.error(`Failed to cache ${cacheKey}`, err));

  //   return result;
  // }

  //   async update(
  //     _id: string,
  //     updateData: { name: string },
  //     user: UserData,
  //   ): Promise<PlatformDocument> {
  //     // Find existing category
  //     const category = await this.credentialModel.findById(_id);
  //     if (!category) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.NotFound,
  //         message: 'erro',
  //         error: 'Not Found',
  //       });
  //     }

  //     // Validate input
  //     if (!updateData.name) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.BadRequest,
  //         message: 'erro',
  //         error: 'Bad Request',
  //       });
  //     }

  //     const normalizedName = updateData.name.trim();
  //     if (normalizedName === category.name) {
  //       return category;
  //     }

  //     // Check for duplicate name
  //     const existingCategory = await this.platformModel.findOne({
  //       _id: { $ne: _id },
  //       name: normalizedName,
  //     });

  //     if (existingCategory) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.Conflict,
  //         message: 'erro',
  //         error: 'Conflict',
  //       });
  //     }
  //     try {
  //       // Instead of directly assigning to updatedAt, use updateOne
  //       const updateResult = await this.platformModel.findByIdAndUpdate(
  //         _id,
  //         {
  //           $set: {
  //             name: normalizedName,

  //             user: {
  //               id: user._id,
  //               username: user.username,
  //               role: user.role,
  //             },
  //           },
  //         },
  //         { new: true },
  //       );

  //       if (!updateResult) {
  //         throw new BadRequestException({
  //           statusCode: StatusCode.NotFound,
  //           message: 'erro',
  //           error: 'Not Found',
  //         });
  //       }

  //       await this.redisCacheService.reset();
  //       return updateResult;
  //     } catch (err) {
  //       if (err.code === 11000) {
  //         throw new BadRequestException({
  //           statusCode: StatusCode.Conflict,
  //           message: 'erro',
  //           error: 'Conflict',
  //         });
  //       }
  //       throw new BadRequestException({
  //         statusCode: StatusCode.ServerError,
  //         message: 'erro',
  //         error: 'Internal Server Error',
  //       });
  //     }
  //   }
}
