export interface CredentialResponse {
  id: string;
  platform: string;
  property: string;
  owner: string;
  apiKey: string;
  accessToken?: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
}
