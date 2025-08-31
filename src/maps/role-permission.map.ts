import { Role } from 'src/common';
import { PermissionsData } from 'src/common/enums/permissions.enum';

export const RolePermissionsMap: Record<Role, PermissionsData[]> = {
  [Role.Admin]: [
    // Super user & User
    PermissionsData.Create_super_user,
    PermissionsData.View_dashboard,
    PermissionsData.View_super_user_list,

    // Post
    PermissionsData.Delete_post,
  ],
  [Role.Manager]: [
    PermissionsData.View_dashboard,
    // Super user & User
    PermissionsData.View_user_list,
    PermissionsData.View_super_user_list,
  ],
};
