import { UserStatus } from 'src/common';
import { Provider } from 'src/common/enums/provider.enum';

export interface UserListData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  avatarUrl: string;
  phone_number?: string;
  isActive: boolean;
  isBlocked: boolean;
  lastLogin: Date;
  account_type: UserStatus;
  provider: Provider;
  providerId: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
