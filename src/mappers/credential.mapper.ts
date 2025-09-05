import { CredentialDocument } from 'src/entities/credential.entity';
import { CredentialResponse } from 'src/modules/credential/responses/data.response';

export function toCredentialDataResponse(
  credential: Partial<CredentialDocument>,
): CredentialResponse {
  return {
    id: credential._id?.toString() ?? '',
    platform: credential.platform_id?.toString() ?? '',
    property: credential.property_id?.toString() ?? '',
    owner: credential.owner?.toString() ?? '',
    apiKey: credential.apiKey ?? '',
    accessToken: credential.accessToken,
    expiresAt: credential.expiresAt,
    lastUsedAt: credential.lastUsedAt,
  };
}
