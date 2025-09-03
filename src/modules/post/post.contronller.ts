import {
  BadRequestException,
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

import { JwtAuthGuard, StatusCode } from 'src/common';
import { CreatePostDto } from './dtos/create.dto';
import { PostService } from './post.service';

@Controller({ path: 'post', version: '1' })
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(
    private readonly postService: PostService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  //   @Get()
  //   @UseGuards(JwtAuthGuard)
  //   async getPlatforms(): Promise<any> {
  //     return this.postService.findAll();
  //   }

  //   @Get('/auth')
  //   @UseGuards(JwtAuthGuard)
  //   async getPlatformUser(
  //     @Req() req,
  //     @Query('propertyId') propertyId?: string,
  //   ): Promise<any> {
  //     const ownerId = req.user.id;

  //     if (!propertyId) {
  //       throw new BadRequestException('propertyId is required');
  //     }

  //     return this.platformService.find(propertyId, ownerId);
  //   }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreatePostDto, @Req() req) {
    const category = await this.postService.create(createFaqDto, req.user);

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

  @Get()
  @UseGuards(JwtAuthGuard)
  async findBySlug(@Query('propertyId') propertyId: string) {
    if (!propertyId) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: 'propertyId is required',
        error: 'Bad Request',
      });
    }

    const posts = await this.postService.findByProperty(propertyId);
    return posts;
  }

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
