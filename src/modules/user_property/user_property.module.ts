import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';
import { PropertyEntity, PropertySchema } from 'src/entities/property.entity';
import {
  UserPropertyEntity,
  UserPropertySchema,
} from 'src/entities/user_properties.entity';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { UserModule } from '../user/user.module';
import { UserPropertyController } from './user_property.controller';
import { UserPropertyService } from './user_property.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPropertyEntity.name, schema: UserPropertySchema },
      { name: PropertyEntity.name, schema: PropertySchema },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AdminModule,
    AuthModule,
    UserModule,
    RedisCacheModule,
    // PropertyModule,
  ],
  controllers: [UserPropertyController],
  providers: [UserPropertyService],
  exports: [UserPropertyService],
})
export class UserPropertyModule {}
