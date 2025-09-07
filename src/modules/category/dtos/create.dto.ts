import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsString()
  platform_id: string;
}
