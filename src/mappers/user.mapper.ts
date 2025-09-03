import { Types } from 'mongoose';
import { UserListData } from 'src/modules/user/responeses/list.reponse';
import { UserData } from 'src/modules/user/responeses/user.response';

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

export function toUserLiteData(user: any): UserData {
  if (!user) {
    return { id: '', username: 'Unknown', email: '', lastName: '' };
  }

  // If it's just ObjectId or string (not populated)
  if (typeof user === 'string' || user instanceof Types.ObjectId) {
    return {
      id: user.toString(),
      username: 'Unknown',
      email: '',
      lastName: '',
    };
  }

  // If it's populated user object
  return {
    id: user._id?.toString() ?? user.id?.toString() ?? '',
    username: user.username || user.firstName || user.name || 'Unknown',
    email: user.email || '',
    lastName: user.lastName || '',
  };
}
