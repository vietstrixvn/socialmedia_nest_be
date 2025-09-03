import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard, StatusCode } from 'src/common';
import { AdminJwtAuthGuard } from 'src/common/guard/jwt-admin.guard';
import { CreatePropertyDto } from './dtos/craete.dto';
import { PropertyService } from './property.service';

@Controller({ path: 'property', version: '1' })
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);

  constructor(
    private readonly propertyService: PropertyService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  @Get('/admin')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async getAdminProperties(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('ownerId') ownerId?: string, // ✨ NEW: Optional owner filter
    @Query('page') page: number = 1,
    @Query('page_size') page_size: number = 10,
  ): Promise<any> {
    const options = { page, page_size };

    return this.propertyService.adminFindAll(
      options,
      startDate,
      ownerId,
      endDate,
    );
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async findBySlug(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    const property = await this.propertyService.findById(id, userId);
    if (!property) {
      throw new BadRequestException({
        statusCode: StatusCode.NotFound,
        message: 'Not Found',
        error: 'Not Found',
      });
    }
    return property;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreatePropertyDto, @Req() req) {
    const category = await this.propertyService.create(createFaqDto, req.user);

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
