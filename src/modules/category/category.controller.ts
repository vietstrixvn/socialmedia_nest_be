import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StatusCode } from 'src/entities/status_code.entity';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { Status, SystemLogType } from '../../entities/system-log.entity';
import { SystemLogService } from '../system-log/system-log.service';
import { Error, Message } from './category.constant';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create.dto';

@Controller({ path: 'category', version: '1' })
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(
    private readonly categoryService: CategoryService,
    private readonly systemLogService: SystemLogService,
  ) {}

  @Get()
  async getCategories(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('page_size') page_size: number = 10,
  ): Promise<any> {
    this.logger.debug('Fetching users with filters:', {
      startDate,
      endDate,
      page,
      page_size,
    });

    const options = {
      page,
      page_size,
    };

    return this.categoryService.findAll(options, startDate, endDate);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreateCategoryDto, @Req() req) {
    const category = await this.categoryService.created(createFaqDto);

    await this.systemLogService.log({
      type: SystemLogType.CategoryCreated,
      note: `User ${req.user.email} created a new CATEGORY.`,
      status: Status.Success,
      data: {
        user: req.user,
        id: category.result._id,
        title: category.result.name,
      },
    });

    return category;
  }

  @Get('/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoryService.findBySlug(slug);
    if (!category) {
      throw new BadRequestException({
        statusCode: StatusCode.ServerError,
        message: Message.CategoryFound,
        error: Error.NOT_FOUND,
      });
    }
    return category;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: { name: string },
    @Req() req,
  ) {
    const updatedCategory = await this.categoryService.update(id, updateData);

    await this.systemLogService.log({
      type: SystemLogType.CategoryUpdated,
      note: `User ${req.user.email} updated CATEGORY ${id}`,
      status: Status.Success,
      data: {
        user: req.user,
        id: updatedCategory._id,
        title: updatedCategory.name,
        changes: updateData,
      },
    });

    return updatedCategory;
  }

  //   @Delete(':id')
  //   @UseGuards(JwtAuthGuard)
  //   async delete(@Param('id') id: string, @Req() req) {
  //     await this.categoryService.delete(id);

  //     await this.systemLogService.log({
  //       type: SystemLogType.DeletedContact,
  //       note: `User ${req.user.name} deleted a category`,
  //       status: Status.Success,
  //       data: {
  //         user: req.user,
  //         blogId: id,
  //       },
  //     });

  //     return { message: 'Category deleted successfully' };
  //   }
}
