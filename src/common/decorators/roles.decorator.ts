// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
