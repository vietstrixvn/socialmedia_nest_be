import { User } from '../modules/super_user/responses/user.interface';
import { Role } from '../common/enums/role.enum';

export function toDataResponse(user: Record<string, any>): User {
  return {
    _id: user._id?.toString() ?? '',
    fristName: user.fristName ?? '',
    lastName: user.lastName ?? '',
    username: user.username ?? '',
    role: (user.role as Role) ?? Role,
    email: user.email ?? '',
    phone_number: user.phone_number ?? '',
    password: user.password ?? '',
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
  };
}
