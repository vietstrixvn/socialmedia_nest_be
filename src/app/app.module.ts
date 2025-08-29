import { CacheModule } from '@nestjs/cache-manager';
import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppBaseController } from './app.base.controller';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database/database.module';
import { AppService } from './app.service';
import { RedisCacheModule } from 'src/modules/cache/redis-cache.module';
import { ApiKeyMiddleware } from 'src/middlewares/api-key.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await import('cache-manager-ioredis'),
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_INDEX'),
        ttl: 60,
      }),
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    RedisCacheModule,
  ],
  controllers: [AppBaseController],
  providers: [
    {
      provide: 'app',
      useClass: AppService,
    },
    ApiKeyMiddleware,
  ],
})
export class AppModule {}
