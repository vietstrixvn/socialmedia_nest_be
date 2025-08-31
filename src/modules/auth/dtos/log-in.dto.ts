import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  ValidationArguments,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsOptional,
} from 'class-validator';

@ValidatorConstraint({ name: 'isUsernameOrEmail', async: false })
export class IsUsernameOrEmailConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string, _args: ValidationArguments) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return emailRegex.test(value) || usernameRegex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid username or email`;
  }
}

export class LogInDTO {
  @IsNotEmpty()
  @IsString()
  @Validate(IsUsernameOrEmailConstraint)
  readonly username!: string;

  @IsNotEmpty()
  @IsString()
  readonly password!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? 'local')
  provider: string;
}
