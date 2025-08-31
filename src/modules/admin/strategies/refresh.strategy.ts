// import { ConfigType } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { AdminJwtPayload } from '../types/admin-jwtPayload';
// import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// import refreshJwtConfig from '../../../configs/refresh-jwt.config';
// import { Request } from 'express';
// import { AdminService } from '../admin.service';

// @Injectable()
// export class RefreshJwtStrategy extends PassportStrategy(
//   Strategy,
//   'refresh-jwt',
// ) {
//   constructor(
//     @Inject(refreshJwtConfig.KEY)
//     private refrshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
//     private adminService: AdminService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: refrshJwtConfiguration.secret,
//       ignoreExpiration: false,
//       passReqToCallback: true,
//     });
//   }

//   // authorization: Bearer sldfk;lsdkf'lskald'sdkf;sdl

//   validate(req: Request, payload: AdminJwtPayload) {
//     const authHeader = req.get('authorization');
//     if (!authHeader) {
//       throw new UnauthorizedException('Missing Authorization header');
//     }

//     const refreshToken = authHeader.replace('Bearer', '').trim();
//     const userId = payload.sub;
//     return this.adminService.validateRefreshToken(userId, refreshToken);
//   }
// }
