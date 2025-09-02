import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';
import { PropertyEntity, PropertySchema } from 'src/entities/property.entity';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PlatformModule } from '../platform/platform.module';
import { SlugProvider } from '../slug/slug.provider';
import { UserModule } from '../user/user.module';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyEntity.name, schema: PropertySchema },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AdminModule,
    AuthModule,
    UserModule,
    RedisCacheModule,
    PlatformModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, SlugProvider],
  exports: [PropertyService],
})
export class PropertyModule {}
