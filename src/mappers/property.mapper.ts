import { PropertyStatus, PropertyType, UserRole } from 'src/common';
import { PropertyDocument } from 'src/entities/property.entity';
import { PropertyResponse } from 'src/modules/property/responses/data.response';
import { toFlatFormDataResponse } from './platform.mapper';
import { toUserLite } from './user.mapper';

export function toPropertyDataResponse(
  property: Partial<PropertyDocument>,
): PropertyResponse {
  return {
    id: property._id?.toString() ?? '',
    name: property.name ?? '',
    slug: property.slug ?? '',
    description: property.description ?? '',
    platform: property.platforms
      ? property.platforms.map((pl: any) => toFlatFormDataResponse(pl))
      : [],
    posts: property.posts?.map((p) => p.toString()) ?? [],
    schedules: property.schedules?.map((s) => s.toString()) ?? [],
    property_status: property.property_status ?? PropertyStatus.FREE,
    property_type: property.property_type ?? PropertyType.FREE,
    owner: toUserLite(property.owner as any),

    members: property.members
      ? property.members.map((m: any) => ({
          user: toUserLite(m.user),
          role: m.role as UserRole,
        }))
      : [],
  };
}
