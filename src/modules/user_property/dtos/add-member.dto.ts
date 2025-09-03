// add-member.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @IsString({ each: true })
  @IsNotEmpty()
  userId: string;

  @IsString({ each: true })
  @IsNotEmpty()
  propertyId: string;
}
