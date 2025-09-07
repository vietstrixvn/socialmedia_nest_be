import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { Status, SystemLogType } from '../../entities/system-log.entity';
import { SystemLogService } from '../system-log/system-log.service';
import { DocumentService } from './document.service';
import { CreateBlogDto } from './dtos/create.dto';

@Controller({ path: 'document', version: '1' })
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly systemLogService: SystemLogService,
  ) {}

  @Get()
  async getBlogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('page_size') page_size: number = 10,
    @Query('category') category?: string,
  ) {
    this.logger.debug('Fetching blogs with filters:', {
      startDate,
      endDate,
      page,
      page_size,
      category,
    });

    try {
      return await this.documentService.findAll(
        { page, page_size },
        startDate,
        endDate,
        category,
      );
    } catch (error) {
      this.logger.error('Error fetching blogs', error.stack);
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors()
  async create(@Body() createBlogDto: CreateBlogDto, @Req() req) {
    const blog = await this.documentService.create(createBlogDto);

    await this.systemLogService.log({
      type: SystemLogType.BlogCreated,
      note: `User ${req.user.email} created a new blog post`,
      status: Status.Success,
      data: {
        user: req.user,
        id: blog.result._id,
        title: blog.result.title,
      },
    });

    return blog;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req) {
    await this.documentService.delete(id);

    await this.systemLogService.log({
      type: SystemLogType.BlogDeleted,
      note: `User ${req.user.name} deleted a blog post`,
      status: Status.Success,
      data: {
        user: req.user,
        blogId: id,
      },
    });

    return { message: 'Blog deleted successfully' };
  }

  @Get(':slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.documentService.findBySlug(slug);
  }
}
