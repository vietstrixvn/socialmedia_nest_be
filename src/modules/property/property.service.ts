import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RedisCacheService } from '../cache/redis-cache.service';

import { StatusCode, StatusType } from 'src/common';
import { PropertyDocument, PropertyEntity } from 'src/entities/property.entity';
import { buildPropertyFilter } from 'src/helpers/property.helper';
import { toPropertyDataResponse } from 'src/mappers/property.mapper';
import { UserLiteData } from 'src/mappers/user.mapper';
import { buildCacheKey } from 'src/utils/cache-key.util';
import { Pagination } from '../paginate/pagination';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';
import { PlatformService } from '../platform/platform.service';
import { SlugProvider } from '../slug/slug.provider';
import { UserService } from '../user/user.service';
import { CreatePropertyDto } from './dtos/craete.dto';
import { PROPERTY_CACHE_TTL } from './property.constant';
import { CreatePropertyResponse } from './responses/create.response';
import { PropertyResponse } from './responses/data.response';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectModel(PropertyEntity.name)
    private readonly propertyModel: Model<PropertyDocument>,
    private readonly slugProvider: SlugProvider,
    private readonly platformService: PlatformService,

    private readonly userService: UserService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(
    options: PaginationOptionsInterface,
    ownerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Pagination<PropertyResponse>> {
    const cacheKey = buildCacheKey('properties', {
      page: options.page,
      limit: options.limit,
      start: startDate,
      end: endDate,
      owner: ownerId,
    });

    const cached =
      await this.redisCacheService.get<Pagination<PropertyResponse>>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = {
      ...buildPropertyFilter({ startDate, endDate }),
      owner: ownerId,
    };

    const properties = await this.propertyModel
      .find(filter)
      .skip((options.page - 1) * options.limit)
      .populate({
        path: 'platforms',
        select: '_id name',
      })
      .limit(options.limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.propertyModel.countDocuments(filter);

    const mappedProperties = properties.map(toPropertyDataResponse);

    const result = new Pagination<PropertyResponse>({
      results: mappedProperties,
      total,
      total_page: Math.ceil(total / options.limit),
      page_size: options.limit,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      PROPERTY_CACHE_TTL.PROPERTY_LIST,
    );
    return result;
  }

  async create(
    createPropertyDto: CreatePropertyDto,
    user: UserLiteData,
  ): Promise<CreatePropertyResponse> {
    const {
      name,
      description,
      platforms,
      property_status,
      property_type,
      members,
    } = createPropertyDto;

    if (!name?.trim()) {
      throw new BadRequestException({ message: 'Name is required' });
    }

    if (!platforms)
      throw new BadRequestException({
        message: 'Error 3',
        code: StatusCode.BadRequest,
      });

    const slug = this.slugProvider.generateSlug(name, { unique: true });

    const [exists, isValidPlatform] = await Promise.all([
      this.propertyModel.findOne({ $or: [{ name }, { slug }] }),
      this.platformService.validateFlatform(platforms),
    ]);

    if (exists)
      throw new BadRequestException({
        message: 'Error 2',
        error: 'Error',
      });

    if (!isValidPlatform)
      throw new BadRequestException({
        message: 'Error 1 ',
        error: 'Error',
      });

    const existingProperty = await this.propertyModel.findOne({
      owner: user.id,
      $or: [{ name }, { slug }],
    });

    if (existingProperty) {
      throw new BadRequestException({
        message: 'Platform with this name already exists',
      });
    }

    const newProperty = new this.propertyModel({
      name,
      slug,
      description,
      platforms,
      property_status,
      property_type,
      members,
      owner: user.id,
    });

    try {
      await this.redisCacheService.delByPattern('properties*');
      const saved = await newProperty.save();

      await this.userService.addOwnedProperty(user.id, saved._id);

      return {
        status: StatusType.Success,
        result: saved,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException({ message: 'Duplicate property name' });
      }
      throw err;
    }
  }

  // async validateFlatform(flatformId: string): Promise<boolean> {
  //   try {
  //     const service = await this.propertyModel.findById(flatformId).exec();
  //     return !!service; // Returns true if service exists, false otherwise
  //   } catch (error) {
  //     this.logger.error(`Error validating service: ${error.message}`);
  //     return false;
  //   }
  // }

  //   async update(
  //     _id: string,
  //     updateData: { name: string },
  //     user: UserData,
  //   ): Promise<PropertyDocument> {
  //     // Find existing category
  //     const category = await this.propertyModel.findById(_id);
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
  //     const existingCategory = await this.propertyModel.findOne({
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
  //       const updateResult = await this.propertyModel.findByIdAndUpdate(
  //         _id,
  //         {
  //           $set: {
  //             name: normalizedName,

  //             user: {
  //               userId: user._id,
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
