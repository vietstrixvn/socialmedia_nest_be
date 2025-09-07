import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Pagination
import { Pagination } from '../paginate/pagination';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';

// Cache
import { buildCacheKey } from '../../utils/cache-key.util';
import { RedisCacheService } from '../cache/redis-cache.service';

// Service
import { CategoryService } from '../category/category.service';
import { SlugProvider } from '../slug/slug.provider';

// Components
import { DocumentDocument, DocumentEntity } from 'src/entities/document.entity';
import { StatusCode, StatusType } from 'src/entities/status_code.entity';
import { buildDocumentFilter } from 'src/helpers/document.helper';
import { toDocumentDataResponse } from 'src/mappers/document.mapper';
import { BLOG_CACHE_TTL, Error, Message } from './document.constant';
import { CreateBlogDto } from './dtos/create.dto';
import { CreateDocumentResponse } from './responses/create.response';
import { DataResponse, DetailResponse } from './responses/data.response';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectModel(DocumentEntity.name)
    private readonly blogModel: Model<DocumentDocument>,
    private readonly slugProvider: SlugProvider,
    private readonly categoryService: CategoryService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(
    options: PaginationOptionsInterface,
    startDate?: string,
    endDate?: string,
    category?: string,
  ): Promise<Pagination<DataResponse>> {
    const cacheKey = buildCacheKey('blogs', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
      category: category || 'all',
    });

    const cached =
      await this.redisCacheService.get<Pagination<DataResponse>>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = buildDocumentFilter({ startDate, endDate, category });

    const [blogs, total] = await Promise.all([
      this.blogModel
        .find(filter)
        .populate('category_id', '_id name')
        .sort({ createdAt: -1 })
        .skip((options.page - 1) * options.page_size)
        .limit(options.page_size),
      this.blogModel.countDocuments(filter),
    ]);

    const results = blogs.map(toDocumentDataResponse);
    const result = new Pagination<DataResponse>({
      results,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      BLOG_CACHE_TTL.BLOG_LIST,
    );
    return result;
  }

  async create(createBlogDto: CreateBlogDto): Promise<CreateDocumentResponse> {
    const { title, content, description, category_id } = createBlogDto;

    if (!category_id)
      throw new BadRequestException({
        message: Message.CATEGORY_REQUIRED,
        code: Error.CATEGORY_REQUIRED,
      });

    if (!title || title.trim() === '') {
      throw new BadRequestException({
        message: 'Title is required to generate slug',
        error: Error.TITLE_REQUIRED,
      });
    }

    const slug = this.slugProvider.generateSlug(title, { unique: true });

    const [exists, isValidCategory] = await Promise.all([
      this.blogModel.findOne({ $or: [{ title }, { slug }] }),
      this.categoryService.validateCategory(category_id),
    ]);

    if (exists)
      throw new BadRequestException({
        message: Message.ThisBlogAlreadyExists,
        error: Error.BLOG_ALREADY_EXISTS,
      });

    if (!isValidCategory)
      throw new BadRequestException({
        message: Message.CategoryValidation,
        error: Error.CATEGORY_VALIDATION,
      });

    const newBlog = new this.blogModel({
      title,
      slug,
      content,
      description,
      category_id,
    });

    try {
      await this.redisCacheService.delByPattern('blogs*');
      this.logger.log('Cleared blog-related cache entries after create');
    } catch (error) {
      this.logger.error('Failed to clear cache after blog creation', error);
    }
    // Save blog and clear cache
    const savedBlog = await newBlog.save();

    // Clear cache related to blogs

    return {
      status: StatusType.Success,
      result: savedBlog,
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id);

    if (result) {
      try {
        await Promise.all([
          this.redisCacheService.delByPattern('blogs*'),
          this.redisCacheService.del(`blog_${result.slug}`),
        ]);
        this.logger.log(`Cleared cache for blog ID ${id} and blog lists`);
      } catch (error) {
        this.logger.error(
          `Failed to clear cache after blog deletion: ${error.message}`,
          error.stack,
        );
      }
    } else {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: Message.BlogNotFound,
        error: Error.BLOG_NOT_FOUND,
      });
    }
  }

  async findBySlug(slug: string): Promise<DetailResponse> {
    const cacheKey = `blog_${slug}`;

    const cached = await this.redisCacheService.get<DetailResponse>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const blog = await this.blogModel.findOne({ slug }).exec();

    if (!blog) {
      this.logger.warn(`Blog with slug '${slug}' not found`);
      throw new NotFoundException({
        message: Message.BlogNotFound,
        error: Error.BLOG_NOT_FOUND,
      });
    }

    const result = toDocumentDataResponse(blog);

    await this.redisCacheService.set(
      cacheKey,
      result,
      BLOG_CACHE_TTL.BLOG_DETAIL,
    );

    return result;
  }
}
