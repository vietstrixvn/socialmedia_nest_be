import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';

import { PostEntity, PostSchema } from 'src/entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PlatformModule } from '../platform/platform.module';
import { PropertyModule } from '../property/property.module';
import { PostController } from './post.contronller';
import { PostService } from './post.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostEntity.name, schema: PostSchema }]),
    JwtModule.registerAsync(jwtConfig.asProvider()),

    AuthModule,
    RedisCacheModule,
    PlatformModule,
    PropertyModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
