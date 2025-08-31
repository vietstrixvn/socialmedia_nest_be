import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

// create-user-local.dto.ts
export class CreateUserLocalDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;
}

// create-user-google.dto.ts
export class CreateUserGoogleDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
  @IsString()
  sub: string;

  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsString()
  verified: boolean;
}

export class CreateUserGithubDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsString()
  verified: boolean;
}
