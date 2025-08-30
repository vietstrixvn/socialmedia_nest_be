import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard, PublicRoute, RolesGuard } from 'src/common';
import { logDebug } from 'src/logger/console';
import { logger } from 'src/logger/logger';
import { AuthService } from '../auth/auth.service';
import { CreateUserLocalDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';

@Controller({ path: 'user', version: '1' })
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @PublicRoute()
  @Post()
  @HttpCode(201)
  async create(
    @Body() createUserLocalDto: CreateUserLocalDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.create(createUserLocalDto);
    const response = await this.authService.login(user._id);

    this.logger.debug(`🔐 Login - ID: ${user._id} | Provider: local`);

    logger.info(`🔐 Login - ID: ${user._id} | Provider: local`);
    logDebug('[TOKEN]:', response.accessToken);

    res.cookie('refresh_auth_token', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'User registered and logged in successfully',
      accessToken: response.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // @Roles(UserRole.Owner)
  // @UseGuards(RolesGuard)
  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  async getUsers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') searchQuery?: string,
    @Query('page') page: number = 1,
    // Check to change limit to page_size
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    this.logger.debug('Fetching users with filters:', {
      startDate,
      endDate,
      searchQuery,
      page,
      limit,
    });

    return this.userService.getAllUsers(
      startDate,
      endDate,
      searchQuery,
      page,
      limit,
    );
  }
}
