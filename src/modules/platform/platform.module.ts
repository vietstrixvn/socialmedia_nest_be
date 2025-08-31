import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';
import { PlatformEntity, PlatformSchema } from 'src/entities/platform.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PlatformController } from './ platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformEntity.name, schema: PlatformSchema },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),

    AuthModule,
    RedisCacheModule,
  ],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
