import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformEntity, PlatformSchema } from 'src/entities/platform.entity';
import { RedisCacheModule } from '../cache/redis-cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformEntity.name, schema: PlatformSchema },
    ]),
    // AuthModule,
    // SystemLogModule,
    RedisCacheModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class PlatformModule {}
