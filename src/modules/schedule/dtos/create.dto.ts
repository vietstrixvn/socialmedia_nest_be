import { Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  post_id: string;

  @Field({ nullable: true })
  platform_id?: string;

  @Field({ nullable: true })
  scheduled_at?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  credential_id?: string;
}
