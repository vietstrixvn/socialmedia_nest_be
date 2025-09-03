import { UserRole } from 'src/common';
import { UserPropertyDocument } from 'src/entities/user_properties.entity';
import { UserPropertyExtendedResponse } from 'src/modules/user_property/reponses/data.response';

export function toUserPropertyDataResponse(
  userProperty: Partial<UserPropertyDocument> & {
    propertyId?: any;
    userId?: any;
  },
): UserPropertyExtendedResponse {
  const populatedProperty =
    typeof userProperty.propertyId === 'object'
      ? userProperty.propertyId
      : null;
  const populatedUser =
    typeof userProperty.userId === 'object' ? userProperty.userId : null;

  return {
    id: userProperty._id?.toString() ?? '',
    propertyId:
      populatedProperty?._id?.toString() ??
      (userProperty.propertyId as string) ??
      '',
    userId:
      populatedUser?._id?.toString() ?? (userProperty.userId as string) ?? '',
    role: userProperty.role ?? UserRole.Member,
    joinedAt: userProperty.joinedAt ?? new Date(),
    permissions: userProperty.permissions ?? {
      canEdit: false,
      canDelete: false,
      canInvite: false,
    },
    isActive: userProperty.isActive ?? true,
    property: populatedProperty
      ? {
          name: populatedProperty.name ?? '',
          slug: populatedProperty.slug ?? '',
          description: populatedProperty.description,
        }
      : undefined,
    user: populatedUser
      ? {
          firstName: populatedUser.firstName ?? '',
          lastName: populatedUser.lastName ?? '',
          email: populatedUser.email ?? '',
          username: populatedUser.username,
        }
      : undefined,
    // Thêm các count
    memberCount: populatedProperty?.memberCount ?? 0,
    platformCount: populatedProperty?.platformCount ?? 0,
    postCount: populatedProperty?.postCount ?? 0,
    createdAt: populatedProperty?.createdAt ?? new Date(),
    owner: populatedProperty?.owner?.userId?.toString() ?? '',
  };
}
