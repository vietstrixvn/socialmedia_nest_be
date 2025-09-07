import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  platform_id: string;
}
