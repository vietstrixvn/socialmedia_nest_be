import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from 'src/configs/jwt.config';
import {
  CredentialEntity,
  CredentialSchema,
} from 'src/entities/credential.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { PlatformModule } from '../platform/platform.module';
import { PropertyModule } from '../property/property.module';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CredentialEntity.name, schema: CredentialSchema },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),

    AuthModule,
    RedisCacheModule,
    PlatformModule,
    PropertyModule,
  ],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}
