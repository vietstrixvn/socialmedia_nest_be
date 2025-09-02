import { IsEnum, IsOptional } from 'class-validator';
import { Status } from 'src/common';

export class UpdateContactDto {
  @IsOptional()
  @IsEnum(Status)
  status: Status;
}
