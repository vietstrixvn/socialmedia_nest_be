import { PropertyDocument } from 'src/entities/property.entity';

export interface CreatePropertyResponse {
  status: string;
  result: PropertyDocument;
}
