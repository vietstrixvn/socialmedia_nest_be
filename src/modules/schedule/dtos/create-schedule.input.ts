// src/modules/schedule/dtos/create-schedule.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateScheduleInput {
  @Field()
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
