import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryEntity, CategorySchema } from '../../entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PlatformModule } from '../platform/platform.module';
import { SlugProvider } from '../slug/slug.provider';
import { SystemLogModule } from '../system-log/system-log.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryEntity.name, schema: CategorySchema },
    ]),
    SystemLogModule,
    AuthModule,
    RedisCacheModule,
    PlatformModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, SlugProvider],
  exports: [CategoryService],
})
export class CategoryModule {}
