import { Provider } from 'src/common/enums/provider.enum';
import { Role } from 'src/common/enums/role.enum';
import { BaseType } from 'src/types/types';

export interface UserListData extends BaseType {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  avatarUrl: string;
  phone_number?: string;
  isActive: boolean;
  lastLogin: Date;
  provider: Provider;
  providerId: string;
  password?: string;
  role: Role;
  isVerified: boolean;
}
