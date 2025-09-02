import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  platform: string; // ObjectId của PlatformEntity

  @IsNotEmpty()
  @IsString()
  property: string; // ObjectId của PropertyEntity

  @IsNotEmpty()
  @IsString()
  apiKey: string;
}
