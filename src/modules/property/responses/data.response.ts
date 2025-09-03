import { PropertyStatus, PropertyType } from 'src/common';
import { PlatformLimitResponse } from 'src/modules/platform/responses/data.response';

export interface PropertyResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  platforms?: PlatformLimitResponse[];
  property_status: PropertyStatus;
  property_type: PropertyType;
}
