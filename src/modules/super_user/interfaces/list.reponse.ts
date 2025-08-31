import { Role } from 'src/common';
import { PermissionsData } from 'src/common/enums/permissions.enum';

export interface AdminListData {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive: boolean;
  password?: string;
  lastLogin: Date;
  phone_number: string;
  role: Role;
  permissions: PermissionsData[];
  createdAt?: Date;
  updatedAt?: Date;
}
