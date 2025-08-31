import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RolesGuard } from 'src/common';
import { AdminJwtAuthGuard } from 'src/common/guard/jwt-admin.guard';
import { CreatePlatformDto } from './dtos/create-flatform.dto';
import { PlatformService } from './platform.service';

@Controller({ path: 'platform', version: '1' })
export class PlatformController {
  private readonly logger = new Logger(PlatformController.name);

  constructor(
    private readonly platformService: PlatformService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  @Get()
  async getCategories(): Promise<any> {
    return this.platformService.findAll();
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreatePlatformDto, @Req() req) {
    const category = await this.platformService.create(createFaqDto, req.user);

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

  @Patch(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: { name: string },
    @Req() req,
  ) {
    const updatedCategory = await this.platformService.update(
      id,
      updateData,
      req.user,
    );

    // await this.systemLogService.log({
    //   type: SystemLogType.CategoryUpdated,
    //   note: `User ${req.user.email} updated CATEGORY ${id}`,
    //   status: Status.Success,
    //   data: {
    //     user: req.user,
    //     id: updatedCategory._id,
    //     title: updatedCategory.name,
    //     changes: updateData,
    //   },
    // });

    return updatedCategory;
  }
}
