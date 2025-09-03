import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/common';
import { AddMemberDto } from './dtos/add-member.dto';
import { UserPropertyService } from './user_property.service';

@Controller({ path: 'user-property', version: '1' })
export class UserPropertyController {
  private readonly logger = new Logger(UserPropertyController.name);

  constructor(
    private readonly userPropertyService: UserPropertyService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getOwnerProperties(
    @Req() req,
    // @Query('startDate') startDate?: string,
    // @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('page_size') page_size: number = 10,
  ): Promise<any> {
    const options = { page, page_size };
    const userId = req.user.id;

    return this.userPropertyService.findAllUserProperties(userId, options);
  }

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // async getMemberProperties(
  //   @Req() req,
  //   // @Query('startDate') startDate?: string,
  //   // @Query('endDate') endDate?: string,
  //   @Query('page') page: number = 1,
  //   @Query('page_size') page_size: number = 10,
  // ): Promise<any> {
  //   const options = { page, page_size };
  //   const userId = req.user.id;

  //   return this.userPropertyService.findPropertiesByMember(userId, options);
  // }

  @Post('add-member')
  @UseGuards(JwtAuthGuard)
  async addMember(@Req() req, @Body() dto: AddMemberDto) {
    const ownerId = req.user.id;
    return this.userPropertyService.addMember(ownerId, dto);
  }

  //   @Get('/admin')
  //   @UseGuards(AdminJwtAuthGuard, RolesGuard)
  //   async getAdminProperties(
  //     @Req() req,
  //     @Query('startDate') startDate?: string,
  //     @Query('endDate') endDate?: string,
  //     @Query('ownerId') ownerId?: string, // ✨ NEW: Optional owner filter
  //     @Query('page') page: number = 1,
  //     @Query('page_size') page_size: number = 10,
  //   ): Promise<any> {
  //     const options = { page, page_size };

  //     return this.userPropertyService.adminFindAll(
  //       options,
  //       startDate,
  //       ownerId,
  //       endDate,
  //     );
  //   }
}
