import {
  BadRequestException,
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

import { Role } from '../../common/enums/role.enum';
import { CreateManagerDto } from './dto/create-manager.dto';
import { SuperUserService } from './superuser.service';
// import { SystemLogService } from '../system-log/system-log.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard } from 'src/common';
import { AdminRoles } from 'src/common/decorators/adminRoles.decorator';
import { AdminJwtAuthGuard } from 'src/common/guard/jwt-admin.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller({ path: 'superuser', version: '1' })
export class SuperUserController {
  private readonly logger = new Logger(SuperUserController.name);

  constructor(
    private readonly supderUserService: SuperUserService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    console.log('REQ.USER:', req.user);
    return this.supderUserService.findOne(req.user.id);
  }

  @Get('statistic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminRoles(Role.Admin)
  async getUserStatistic() {
    return this.supderUserService.getUserStatistic();
  }

  @Post('manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminRoles(Role.Admin)
  @UseInterceptors(FileInterceptor(''))
  async createManager(@Body() body: CreateManagerDto, @Req() req) {
    const manager = await this.supderUserService.createManagerUser(
      body,
      req.user,
    );

    // await this.systemLogService.log({
    //   type: SystemLogType.CreateManager,
    //   note: `Admin create manager with ID: ${manager.data._id}`,
    //   status: Status.Success,
    //   data: {
    //     user: req.user,
    //     id: manager.data._id,
    //     title: `Admin create manager name ${manager.data.lastName}${manager.data.fristName}`,
    //   },
    // });

    return manager;
  }

  // @Get()
  // @UseGuards(JwtCookieAuthGuard, RolesGuard)
  // @AdminRoles(Role.Admin)
  // async getUsers(
  //   @Query('role') role?: Role,
  //   @Query('startDate') startDate?: string,
  //   @Query('endDate') endDate?: string,
  //   @Query('search') searchQuery?: string,
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ): Promise<any> {
  //   this.logger.debug('Fetching users with filters:', {
  //     role,
  //     startDate,
  //     endDate,
  //     searchQuery,
  //     page,
  //     limit,
  //   });

  //   return this.userService.getAllUsers(
  //     role,
  //     startDate,
  //     endDate,
  //     searchQuery,
  //     page,
  //     limit,
  //   );
  // }

  @Delete('manager/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminRoles(Role.Admin)
  async deleteManager(@Param('id') userId: string) {
    // Ghi log nếu cần
    this.logger.warn(`Deleting manager with ID: ${userId}`);
    const result = await this.supderUserService.deleteManagerById(userId);

    // Ghi log hệ thống (nếu cần dùng SystemLogService)
    // await this.systemLogService.log({
    //   type: SystemLogType.DeletedUser,
    //   note: `Admin deleted manager with ID: ${userId}`,
    //   status: Status.Success,
    // });

    return result;
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async updatePassword(
    @Req() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new BadRequestException('Invalid token: Missing user ID');
    }

    return this.supderUserService.initiatePasswordChange(
      userId,
      updatePasswordDto,
    );
  }

  @Post('verify-code')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async verifyCodeAndUpdatePassword(
    @Req() req,
    @Body() verifyCodeDto: VerifyCodeDto,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Invalid token: Missing user ID');
    }
    return this.supderUserService.verifyCodeAndUpdatePassword(
      userId,
      verifyCodeDto.code,
    );
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  async getUsers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') searchQuery?: string,
    @Query('page') page: number = 1,
    @Query('limit') page_size: number = 10,
  ): Promise<any> {
    this.logger.debug('Fetching users with filters:', {
      startDate,
      endDate,
      searchQuery,
      page,
      page_size,
    });

    return this.supderUserService.getAllUsers(
      startDate,
      endDate,
      searchQuery,
      page,
      page_size,
    );
  }
}
