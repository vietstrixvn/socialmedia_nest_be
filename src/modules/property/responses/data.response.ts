import { PropertyStatus, PropertyType, UserRole } from 'src/common';
import { UserLiteData } from 'src/mappers/user.mapper';
import { PlatformLimitResponse } from 'src/modules/platform/responses/data.response';

export interface PropertyResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  platforms?: PlatformLimitResponse[];
  posts: string[];
  schedules: string[];
  property_status: PropertyStatus;
  property_type: PropertyType;
  members: {
    user: UserLiteData;
    role: UserRole;
  }[];
  owner: UserLiteData;
}
