import { PlatformDocument } from 'src/entities/platform.entity';
import { PlatformResponse } from 'src/modules/platform/responses/data.response';

export function toFlatFormDataResponse(
  platform: Partial<PlatformDocument>,
): PlatformResponse {
  return {
    id: platform._id?.toString() ?? '',
    name: platform.name ?? '',
    supportsVideos: platform.supportsVideos ?? false,
    supportsImages: platform.supportsImages ?? false,
    supportsText: platform.supportsText ?? false,
    maxTextLength: platform.maxTextLength ?? null,
    maxFileSize: platform.maxFileSize ?? null,
    supportedFormats: platform.supportedFormats ?? [],
  };
}
