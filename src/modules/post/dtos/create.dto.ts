import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media_urls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  schedules?: string[];

  @IsNotEmpty()
  @IsString()
  propertyId: string;
}
