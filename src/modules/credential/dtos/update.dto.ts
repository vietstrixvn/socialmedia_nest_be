import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { CreateCredentialDto } from './create.dto';

export class UpdateCredentialDto extends PartialType(CreateCredentialDto) {
  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @IsDateString()
  @IsOptional()
  lastUsedAt?: Date;
}
