import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';
import { ScheduleEntity, ScheduleSchema } from 'src/entities/schedule.entity';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PostModule } from '../post/post.module';
import { PropertyModule } from '../property/property.module';
import { UserModule } from '../user/user.module';
import { ScheduleController } from './schedule.contronller';
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
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class SchedulePostModule {}
