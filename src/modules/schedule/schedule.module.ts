import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';
import { ScheduleEntity, ScheduleSchema } from 'src/entities/schedule.entity';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PlatformModule } from '../platform/platform.module';
import { PostModule } from '../post/post.module';
import { PropertyModule } from '../property/property.module';
import { UserModule } from '../user/user.module';
import { ScheduleController } from './schedule.contronller';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleEntity.name, schema: ScheduleSchema },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AdminModule,
    AuthModule,
    UserModule,
    RedisCacheModule,
    PostModule,
    PropertyModule,
    PlatformModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleResolver],
  exports: [ScheduleService],
})
export class SchedulePostModule {}
