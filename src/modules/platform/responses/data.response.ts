export interface PlatformResponse {
  id: string;
  name: string;

  supportsVideos: boolean;
  supportsImages: boolean;
  supportsText: boolean;

  maxTextLength: number | null;
  maxFileSize: number | null;
  supportedFormats: string[];

  baseUrl: string | null;
  authUrl: string | null;
  apiVersion: string | null;
}

export interface PlatformLimitResponse {
  id: string;
  name: string;
}
