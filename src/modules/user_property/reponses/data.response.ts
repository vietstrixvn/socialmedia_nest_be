import { UserRole } from 'src/common';

export interface UserPropertyResponse {
  id: string;
  propertyId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
  };
  isActive: boolean;

  user?: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
  };
  property?: {
    name: string;
    slug: string;
    description?: string;
  };
}

export interface UserPropertyExtendedResponse extends UserPropertyResponse {
  memberCount: number;
  platformCount: number;
  postCount: number;
  createdAt: Date;
  owner: string;
}
