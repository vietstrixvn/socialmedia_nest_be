import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { AdminJwtAuthGuard } from 'src/common/guard/jwt-admin.guard';
import { logDebug } from 'src/logger/console';
import { logger } from 'src/logger/logger';
import { PublicRoute } from '../../common/decorators/public.decorator';
import { AdminService } from './admin.service';
import { LogInDTO } from './dtos/log-in.dto';
import { RefreshAdminGuard } from './guards/refresh-admin/refresh-admmin.guard';
import { LogInResponse } from './responses/log-in.response';

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly service: AdminService) {}

  @PublicRoute()
  @UseGuards(AdminJwtAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LogInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogInResponse> {
    const { _id, accessToken, refreshToken } =
      await this.service.validateAttemptAndSignToken(dto);

    res.cookie('refresh_admin_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    logger.info(
      `🔐 Login attempt - ID: ${_id} | Method: credentials | Username: ${dto.username}`,
    );

    return { _id, accessToken };
  }

  @UseGuards(RefreshAdminGuard)
  @Post('refresh')
  refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.service
      .refreshToken(req.user.id)
      .then(({ accessToken, refreshToken }) => {
        res.cookie('refresh_admin_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        logger.info(
          `🔐 Login attempt - ID: ${req.user.id} | Method: refresh-login`,
        );
        logDebug('[TOKEN]', accessToken);

        return { accessToken }; // 👈 chỉ trả accessToken, refresh giữ ở cookie
      });
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('signout')
  signOut(@Req() req) {
    this.service.signOut(req.user.id);
  }
}
