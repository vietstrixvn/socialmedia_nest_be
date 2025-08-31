import { UserListData } from 'src/modules/user/responeses/list.reponse';

export function UserDataResponse(user: Record<string, any>): UserListData {
  return {
    _id: user._id?.toString() ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    avatarUrl: user.avatarUrl ?? '',
    phone_number: user.phone_number ?? '',
    isActive: user.isActive ?? '',
    isBlocked: user.isBlocked ?? '',
    lastLogin: user.createdAt ?? Date(),
    account_type: user.account_type ?? '',
    password: user.password ?? '',
    provider: user.provider ?? '',
    providerId: user.providerId ?? '',
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
  };
}

export interface UserLiteData {
  id: string;
}
