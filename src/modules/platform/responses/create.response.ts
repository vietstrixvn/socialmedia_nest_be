import { PlatformDocument } from 'src/entities/platform.entity';

export interface CreateFlatformResponse {
  status: string;
  result: PlatformDocument;
}
