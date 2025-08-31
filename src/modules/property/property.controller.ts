import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common';
import { CreatePropertyDto } from './dtos/craete.dto';
import { PropertyService } from './property.service';

@Controller({ path: 'property', version: '1' })
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);

  constructor(
    private readonly propertyService: PropertyService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async get(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    const options = { page, limit };
    const ownerId = req.user.id;

    return this.propertyService.findAll(options, ownerId, startDate, endDate);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreatePropertyDto, @Req() req) {
    const category = await this.propertyService.create(createFaqDto, req.user);

    // await this.systemLogService.log({
    //   type: SystemLogType.CategoryCreated,
    //   note: `User ${req.user.email} created a new CATEGORY.`,
    //   status: Status.Success,
    //   data: {
    //     user: req.user,
    //     id: category.result._id,
    //     title: category.result.name,
    //   },
    // });

    return category;
  }

  //   @Get('/:slug')
  //   async findBySlug(@Param('slug') slug: string) {
  //     const category = await this.categoryService.findBySlug(slug);
  //     if (!category) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.ServerError,
  //         message: Message.CategoryFound,
  //         error: Error.NOT_FOUND,
  //       });
  //     }
  //     return category;
  //   }

  //   @Patch(':id')
  //   @UseGuards(JwtAuthGuard)
  //   async update(
  //     @Param('id') id: string,
  //     @Body() updateData: { name: string },
  //     @Req() req,
  //   ) {
  //     const updatedCategory = await this.categoryService.update(
  //       id,
  //       updateData,
  //       req.user,
  //     );

  //     await this.systemLogService.log({
  //       type: SystemLogType.CategoryUpdated,
  //       note: `User ${req.user.email} updated CATEGORY ${id}`,
  //       status: Status.Success,
  //       data: {
  //         user: req.user,
  //         id: updatedCategory._id,
  //         title: updatedCategory.name,
  //         changes: updateData,
  //       },
  //     });

  //     return updatedCategory;
  //   }

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

  //   @Patch(':id/status')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Roles(Role.Admin)
  //   @UseInterceptors(FileInterceptor(''))
  //   async updateStatus(
  //     @Param('id') id: string,
  //     @Body('status') status: CategoryStatus,
  //   ) {
  //     return this.categoryService.updateStatus(id, status);
  //   }
}
