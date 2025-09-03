import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common';
import { CreateScheduleDto } from './dtos/create.dto';
import { ScheduleService } from './schedule.service';

@Controller({ path: 'schedule', version: '1' })
export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);

  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreateScheduleDto, @Req() req) {
    const schedule = await this.scheduleService.create(createFaqDto, req.user);

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

    return schedule;
  }

  //   @Get()
  //   @UseGuards(JwtAuthGuard)
  //   async findBySlug(@Query('propertyId') propertyId: string) {
  //     if (!propertyId) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.BadRequest,
  //         message: 'propertyId is required',
  //         error: 'Bad Request',
  //       });
  //     }

  //     const posts = await this.postService.findByProperty(propertyId);
  //     return posts;
  //   }

  //   @Patch(':id')
  //   @UseGuards(AdminJwtAuthGuard, RolesGuard)
  //   async update(
  //     @Param('id') id: string,
  //     @Body() updateData: { name: string },
  //     @Req() req,
  //   ) {
  //     const updatedCategory = await this.platformService.update(
  //       id,
  //       updateData,
  //       req.user,
  //     );

  //     // await this.systemLogService.log({
  //     //   type: SystemLogType.CategoryUpdated,
  //     //   note: `User ${req.user.email} updated CATEGORY ${id}`,
  //     //   status: Status.Success,
  //     //   data: {
  //     //     user: req.user,
  //     //     id: updatedCategory._id,
  //     //     title: updatedCategory.name,
  //     //     changes: updateData,
  //     //   },
  //     // });

  //     return updatedCategory;
  //   }
}
