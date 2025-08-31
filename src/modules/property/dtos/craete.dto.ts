import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PropertyStatus, PropertyType } from 'src/common';

export class CreatePropertyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  platform?: string[];

  @IsOptional()
  @IsString()
  property_status?: PropertyStatus;

  @IsOptional()
  @IsString()
  property_type?: PropertyType;

  @IsOptional()
  @IsArray()
  members?: {
    user: string;
    role: string;
  }[];
}
