// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { BadRequestException } from '@nestjs/common';
// import { Strategy } from 'passport-strategy';
// import { ConfigService } from '@nestjs/config';
// import { AuthError, AuthStrategy } from '../admin.constant';
// import { Request } from 'express';

// @Injectable()
// export class SecretStrategy extends PassportStrategy(
//   Strategy,
//   AuthStrategy.Secret,
// ) {
//   constructor(private readonly configService: ConfigService) {
//     super({
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request): Promise<boolean> {
//     const secret = this.configService.get<string>('NEXT_PRIVATE_API_KEY');
//     if (req.header(AuthStrategy.Secret) !== secret) {
//       throw new BadRequestException(AuthError.InvalidSecret);
//     }
//     return true;
//   }
// }
