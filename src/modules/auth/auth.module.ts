import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import jwtConfig from '../../configs/jwt.config';
import refreshJwtConfig from '../../configs/refresh-jwt.config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
// import { RefreshJwtStrategy } from './strategies/refresh.strategy';
// import { APP_GUARD } from '@nestjs/core';

import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from 'src/common';
import { EmailModule } from 'src/common/modules/register.module';
import githubOauthConfig from 'src/configs/github-oauth.config';
import { UserEntity, UserSchema } from 'src/entities/user.entity';
import googleOauthConfig from '../../configs/google-oauth.config';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(githubOauthConfig),
    RedisCacheModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    JwtAuthGuard,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AuthModule {}
