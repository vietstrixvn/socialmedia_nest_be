import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common';
import { logDebug } from 'src/logger/console';
import { logger } from 'src/logger/logger';
import { PublicRoute } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LogInDTO } from './dtos/log-in.dto';
import { GithubAuthGuard } from './guards/github-auth/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { LogInResponse } from './responeses/log-in.response';
import { CurrentUser } from './types/current-user';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user.id);
  }

  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async authRefresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const currentUser = req.user as CurrentUser;

    const { accessToken, refreshToken } =
      await this.authService.authRefresh(currentUser);

    res.cookie('refresh_auth_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    this.logger.debug(`🔐 Refresh - ID: ${currentUser.id}`);
    logDebug('[TOKEN]', accessToken);

    return { accessToken };
  }

  @PublicRoute()
  @Post('userLogin')
  @HttpCode(HttpStatus.OK)
  async userLogin(
    @Body() dto: LogInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogInResponse> {
    dto.provider = dto.provider ?? 'local';

    const { _id, accessToken, refreshToken } =
      await this.authService.userLogin(dto);
    res.cookie('refresh_auth_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    this.logger.debug(`🔐 Login - ID: ${_id} | Provider: local`);
    logger.info(
      `🔐 Login attempt - ID: ${_id} | Method: credentials  | Provider: ${dto.provider} | Username: ${dto.username}`,
    );
    logDebug('[TOKEN]', accessToken);

    return { _id, accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_auth_token');

    return { message: 'Signed out successfully' };
  }

  // Google Login
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);
    logger.info(
      `🔐 Login - ID: ${req.user.id} | Provider: ${req.user.provider}`,
    );
    logDebug('[TOKEN]', response.accessToken);
    return res.send(`Login thành công! Token: ${response.accessToken}`);
  }

  // Github login
  @PublicRoute()
  @UseGuards(GithubAuthGuard)
  @Get('github/login')
  githubLogin() {}

  @PublicRoute()
  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  async githubCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);
    logger.info(
      `🔐 Login - ID: ${req.user.id} | Provider: ${req.user.provider} `,
    );
    logDebug('[TOKEN]:', response.accessToken);
    return res.send(`Login thành công! Token: ${response.accessToken}`);
  }
}
