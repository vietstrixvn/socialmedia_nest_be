import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperUserController } from './superuser.controller';
import { SuperUserService } from './superuser.service';
// import { SystemLogModule } from '../system-log/system-log.module';
import { RedisCacheModule } from '../cache/redis-cache.module';

// Email Service
// import { EmailPasswordModule } from 'src/common/email/password_email.module';
// import { EmailPasswordService } from 'src/services/email_password.service';
import { AdminModule } from '../admin/admin.module';
import {
  SuperUserEntity,
  SuperUserSchema,
} from 'src/entities/super.user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/configs/jwt.config';
import refreshJwtConfig from 'src/configs/refresh-jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SuperUserEntity.name, schema: SuperUserSchema },
    ]),
    AdminModule,
    // SystemLogModule,
    // EmailPasswordModule,
    RedisCacheModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [SuperUserController],
  providers: [SuperUserService],
  exports: [SuperUserService],
})
export class SuperUserModule {}
