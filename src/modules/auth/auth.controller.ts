import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { LogInDTO } from './dtos/log-in.dto';
import { LogInResponse } from './responeses/log-in.response';
import { Response } from 'express';
import { PublicRoute } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common';
import { GithubAuthGuard } from './guards/github-auth/github-auth.guard';
import { logger } from 'src/logger/logger';
import { logDebug } from 'src/logger/console';

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

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService
      .refreshToken(req.user.id)
      .then(({ accessToken, refreshToken }) => {
        res.cookie('refresh_auth_token', refreshToken, {
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
  signOut(@Req() req) {
    this.authService.signOut(req.user.id);
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
