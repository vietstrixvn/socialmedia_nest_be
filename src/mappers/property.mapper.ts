import { Types } from 'mongoose';
import { PropertyStatus, PropertyType } from 'src/common';
import { PropertyDocument } from 'src/entities/property.entity';
import { PropertyResponse } from 'src/modules/property/responses/data.response';
import { toPlatformLimitDataResponse } from './platform.mapper';

export function toPropertyDataResponse(
  property: Partial<PropertyDocument>,
): PropertyResponse {
  return {
    id: property._id?.toString() ?? '',
    name: property.name ?? '',
    slug: property.slug ?? '',
    description: property.description ?? '',
    platforms: property.platforms
      ? property.platforms.map((pl: any) => toPlatformLimitDataResponse(pl))
      : [],
    posts: property.posts?.map((p) => p.toString()) ?? [],
    schedules: property.schedules?.map((s) => s.toString()) ?? [],
    property_status: property.property_status ?? PropertyStatus.FREE,
    property_type: property.property_type ?? PropertyType.FREE,
    owner: property.owner ?? {},
    members: (property.members ?? []).map((m) => ({
      role: m.role,
      user:
        typeof m.user === 'string' || m.user instanceof Types.ObjectId
          ? { id: m.user.toString() } // minimal UserLiteData
          : { id: m.user._id.toString(), name: m.user.firstName }, // fill fields from UserEntity
    })),
  };
}
