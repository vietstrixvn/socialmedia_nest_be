import { PartialType } from '@nestjs/mapped-types';
import { CreateUserLocalDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserLocalDto) {}
