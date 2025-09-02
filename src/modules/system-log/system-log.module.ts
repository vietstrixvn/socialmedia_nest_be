import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemLog, SystemLogSchema } from '../../entities/system-log.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { SystemLogController } from './system-log.controller';
import { SystemLogService } from './system-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemLog.name, schema: SystemLogSchema },
    ]),
    AuthModule,
    RedisCacheModule,
  ],
  providers: [SystemLogService],
  controllers: [SystemLogController],
  exports: [SystemLogService],
})
export class SystemLogModule {}
