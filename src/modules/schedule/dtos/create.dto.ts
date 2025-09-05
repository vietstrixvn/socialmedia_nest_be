import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  post_id: string;

  @IsNotEmpty()
  @IsString()
  platform_id: string;

  @IsOptional()
  @IsString()
  credential_id?: Types.ObjectId | string;

  @IsNotEmpty()
  @IsDateString()
  scheduled_at: Date | string;
}
