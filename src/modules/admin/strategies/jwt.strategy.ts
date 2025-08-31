import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../../../configs/jwt.config';
import { AdminService } from '../admin.service';
import { AdminJwtPayload } from '../types/admin-jwtPayload';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret!,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AdminJwtPayload) {
    const userId = payload.sub;
    console.log(`Admin JWT payload.sub: ${userId}`);
    const user = await this.adminService.validateJwtAdmin(userId);
    return user;
  }
}
