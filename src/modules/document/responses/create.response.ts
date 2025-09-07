import { DocumentDocument } from 'src/entities/document.entity';

export interface CreateDocumentResponse {
  status: string;
  result: DocumentDocument;
}
