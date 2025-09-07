import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentEntity, DocumentSchema } from 'src/entities/document.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { CategoryModule } from '../category/category.module';
import { SlugProvider } from '../slug/slug.provider';
import { SystemLogModule } from '../system-log/system-log.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    AuthModule,
    SystemLogModule,
    RedisCacheModule,
    CategoryModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService, SlugProvider],
  exports: [DocumentService],
})
export class DocumentModule {}
