import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import refreshJwtConfig from '../../../configs/refresh-jwt.config';
import { AuthService } from '../auth.service';
import { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      // Lấy từ cookie thay vì Authorization header
      jwtFromRequest: (req) => {
        return req?.cookies?.refresh_auth_token;
      },
      secretOrKey: refreshJwtConfiguration.secret!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req?.cookies?.refresh_auth_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    console.log('Validating refresh token for user:', payload.sub);

    return this.authService.validateRefreshToken(payload.sub, refreshToken);
  }
}
