export interface PlatformResponse {
  id: string;
  name: string;
  supportsVideos: boolean;
  supportsImages: boolean;
  supportsText: boolean;
  maxTextLength: number | null;
  maxFileSize: number | null;
  supportedFormats: string[];
}
