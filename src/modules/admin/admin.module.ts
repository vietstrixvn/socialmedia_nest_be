import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from 'src/common';

import { JwtModule } from '@nestjs/jwt';

import { SuperUserEntity, SuperUserSchema } from 'src/entities';

import jwtConfig from 'src/configs/jwt.config';
import refreshJwtConfig from 'src/configs/refresh-jwt.config';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminJwtStrategy } from './strategies/jwt.strategy';
import { SuperUserService } from '../super_user/superuser.service';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { AdminJwtAuthGuard } from 'src/common/guard/jwt-admin.guard';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: SuperUserEntity.name, schema: SuperUserSchema },
    ]),
    // PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    RedisCacheModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminJwtStrategy,
    RolesGuard,
    AdminService,
    AdminJwtAuthGuard,
    SuperUserService,
  ],
  exports: [RolesGuard, JwtModule],
})
export class AdminModule {}
