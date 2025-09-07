import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { redisConfig, setupConfig } from 'src/configs/app';
import { DatabaseModule } from 'src/database/database.module';
import { ApiKeyMiddleware } from 'src/middlewares/api-key.middleware';
import { CorsMiddleware } from 'src/middlewares/cors.middleware';
import { RateLimitMiddleware } from 'src/middlewares/rate-limiter.middleware';
import { AdminModule } from 'src/modules/admin/admin.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RedisCacheModule } from 'src/modules/cache/redis-cache.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { ContactModule } from 'src/modules/contact/contact.module';
import { CredentialModule } from 'src/modules/credential/credential.module';
import { DocumentModule } from 'src/modules/document/document.module';
import { PlatformModule } from 'src/modules/platform/platform.module';
import { PostModule } from 'src/modules/post/post.module';
import { PropertyModule } from 'src/modules/property/property.module';
import { SchedulePostModule } from 'src/modules/schedule/schedule.module';
import { SuperUserModule } from 'src/modules/super_user/superuser.module';
import { SystemLogModule } from 'src/modules/system-log/system-log.module';
import { UserModule } from 'src/modules/user/user.module';
import { UserPropertyModule } from 'src/modules/user_property/user_property.module';
import { AppBaseController } from './app.base.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [setupConfig, redisConfig],
      envFilePath: [`env/.env.${process.env.NODE_ENV || 'local'}`],
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

    // Admin & SuperUser
    AdminModule,
    SuperUserModule,
    CategoryModule,
    DocumentModule,
    ContactModule,
    SystemLogModule,

    AuthModule,
    UserModule,

    UserPropertyModule,
    PropertyModule,
    PlatformModule,
    CredentialModule,
    PostModule,
    SchedulePostModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Request logger middleware

    // consumer.apply(RequestLoggerMiddleware).forRoutes('*');

    consumer.apply(CorsMiddleware).forRoutes('*');

    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
