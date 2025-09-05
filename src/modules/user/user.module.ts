import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/common/modules/register.module';
import jwtConfig from 'src/configs/jwt.config';
import refreshJwtConfig from 'src/configs/refresh-jwt.config';
import { UserEntity, UserSchema } from 'src/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(jwtConfig),
    EmailModule,
    AuthModule,
    RedisCacheModule,
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtStrategy, UserResolver],
  exports: [UserService],
})
export class UserModule {}
