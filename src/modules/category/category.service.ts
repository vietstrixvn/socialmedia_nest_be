import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatusCode, StatusType } from 'src/entities/status_code.entity';
import { buildCategoryFilter } from 'src/helpers/category.helpter';
import { toCategoryDataResponse } from 'src/mappers/category.mapper';
import {
  CategoryDocument,
  CategoryEntity,
} from '../../entities/category.entity';
import { buildCacheKey } from '../../utils/cache-key.util';
import { RedisCacheService } from '../cache/redis-cache.service';
import { Pagination } from '../paginate/pagination';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';
import { PlatformService } from '../platform/platform.service';
import { SlugProvider } from '../slug/slug.provider';
import { CATEGORY_CACHE_TTL, Error, Message } from './category.constant';
import { CreateCategoryDto } from './dtos/create.dto';
import { CreateCategoryResponse } from './responses/create.response';
import { DataResponse } from './responses/data.response';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly slugProvider: SlugProvider,
    private readonly redisCacheService: RedisCacheService,
    private readonly platformService: PlatformService,
  ) {}

  async findAll(
    options: PaginationOptionsInterface,
    startDate?: string,
    endDate?: string,
  ): Promise<Pagination<DataResponse>> {
    const cacheKey = buildCacheKey('categories', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
    });
    const cached =
      await this.redisCacheService.get<Pagination<DataResponse>>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = buildCategoryFilter({ startDate, endDate });

    const categories = await this.categoryModel
      .find(filter)
      .skip((options.page - 1) * options.page_size)
      .limit(options.page_size)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.categoryModel.countDocuments(filter);

    const mappedCategories = categories.map(toCategoryDataResponse);

    const result = new Pagination<DataResponse>({
      results: mappedCategories,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      CATEGORY_CACHE_TTL.CATEGORY_LIST,
    );
    return result;
  }

  async created(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryResponse> {
    const { name, isActive, platform_id } = createCategoryDto;

    // Validate title
    if (!name || name.trim() === '') {
      throw new BadRequestException({
        message: 'Name is required to generate slug',
        error: Error.NAME_REQUIRED,
      });
    }

    const slug = this.slugProvider.generateSlug(name, { unique: true });

    const isValidPlatform =
      await this.platformService.validateLimitPlarform(platform_id);
    if (!isValidPlatform) {
      throw new BadRequestException({
        message: 'One or more platforms do not exist',
        code: StatusCode.BadRequest,
      });
    }

    const existingCategory = await this.categoryModel.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory)
      throw new BadRequestException({
        message: Message.ThisCategoryAlreadyExists,
        error: Error.CATEGORY_ALREADY_EXISTS,
      });

    const newCategory = new this.categoryModel({
      name,
      slug,
      isActive,
      platform_id,
    });

    try {
      await this.redisCacheService.delByPattern('categories*');
      await this.redisCacheService.del(`categories${slug}`);

      const saved = await newCategory.save();

      return {
        status: StatusType.Success,
        result: saved,
      };
    } catch (err) {
      if (err.code === 11000) {
        throw new BadRequestException({
          message: Message.ThisCategoryAlreadyExists,
          error: Error.CATEGORY_ALREADY_EXISTS,
        });
      }
      throw err;
    }
  }

  async findBySlug(slug: string): Promise<DataResponse> {
    const cacheKey = `category_${slug}`;
    const cached = await this.redisCacheService.get<DataResponse>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const category = await this.categoryModel.findOne({ slug }).lean();
    if (!category) {
      throw new BadRequestException({
        statusCode: StatusCode.NotFound,
        message: Message.CategoryNotFound,
        error: Error.NOT_FOUND,
      });
    }

    const categoryData = {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      isActive: category.isActive ?? true, // thêm nè
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    const result = toCategoryDataResponse(categoryData);
    await this.redisCacheService
      .set(cacheKey, result, 3600)
      .catch((err) => this.logger.error(`Failed to cache ${cacheKey}`, err));

    return result;
  }

  async validateCategory(categoryId: string): Promise<boolean> {
    try {
      const service = await this.categoryModel.findById(categoryId).exec();
      return !!service; // Returns true if service exists, false otherwise
    } catch (error) {
      this.logger.error(`Error validating service: ${error.message}`);
      return false;
    }
  }

  async update(
    _id: string,
    updateData: { name: string },
  ): Promise<CategoryDocument> {
    // Find existing category
    const category = await this.categoryModel.findById(_id);
    if (!category) {
      throw new BadRequestException({
        statusCode: StatusCode.NotFound,
        message: Message.CategoryNotFound,
        error: 'Not Found',
      });
    }

    // Validate input
    if (!updateData.name) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: Error.CategoryRequired,
        error: 'Bad Request',
      });
    }

    const normalizedName = updateData.name.trim();
    if (normalizedName === category.name) {
      return category;
    }

    // Check for duplicate name
    const existingCategory = await this.categoryModel.findOne({
      _id: { $ne: _id },
      name: normalizedName,
    });

    if (existingCategory) {
      throw new BadRequestException({
        statusCode: StatusCode.Conflict,
        message: Message.ThisCategoryAlreadyExists,
        error: 'Conflict',
      });
    }
    try {
      // Instead of directly assigning to updatedAt, use updateOne
      const updateResult = await this.categoryModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            name: normalizedName,
            slug: this.slugProvider.generateSlug(normalizedName, {
              unique: true,
            }),
          },
        },
        { new: true },
      );

      if (!updateResult) {
        throw new BadRequestException({
          statusCode: StatusCode.NotFound,
          message: Message.CategoryNotFound,
          error: 'Not Found',
        });
      }

      await this.redisCacheService.reset();
      return updateResult;
    } catch (err) {
      if (err.code === 11000) {
        throw new BadRequestException({
          statusCode: StatusCode.Conflict,
          message: Message.ThisCategoryAlreadyExists,
          error: 'Conflict',
        });
      }
      throw new BadRequestException({
        statusCode: StatusCode.ServerError,
        message: Error.InternalServer,
        error: 'Internal Server Error',
      });
    }
  }
}
