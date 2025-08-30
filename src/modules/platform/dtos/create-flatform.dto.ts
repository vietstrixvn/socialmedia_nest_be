import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlatformDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  supportsImages?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsVideos?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsText?: boolean;

  @IsOptional()
  @IsInt()
  maxTextLength?: number;

  @IsOptional()
  @IsInt()
  maxFileSize?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedFormats?: string[];
}
