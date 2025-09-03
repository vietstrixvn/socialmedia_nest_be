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
    property_status: property.property_status ?? PropertyStatus.FREE,
    property_type: property.property_type ?? PropertyType.FREE,
  };
}
