import { PlatformDocument } from 'src/entities/platform.entity';
import {
  PlatformLimitResponse,
  PlatformResponse,
} from 'src/modules/platform/responses/data.response';

export function toFlatFormDataResponse(
  platform: Partial<PlatformDocument>,
): PlatformResponse {
  return {
    id: platform._id?.toString() ?? '',
    name: platform.name ?? '',
    supportsVideos: platform.supportsVideos ?? false,
    supportsImages: platform.supportsImages ?? false,
    supportsText: platform.supportsText ?? false,
    maxTextLength: platform.maxTextLength ?? 0,
    maxFileSize: platform.maxFileSize ?? 0,
    supportedFormats: platform.supportedFormats ?? [],
  };
}

export function toPlatformLimitDataResponse(
  platform: Partial<PlatformDocument>,
): PlatformLimitResponse {
  return {
    id: platform._id?.toString() ?? '',
    name: platform.name ?? '',
  };
}
