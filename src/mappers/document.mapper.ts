import { DocumentDocument } from 'src/entities/document.entity';
import { DataResponse } from 'src/modules/document/responses/data.response';

export function toDocumentDataResponse(
  document: Partial<DocumentDocument>,
): DataResponse {
  return {
    id: document._id?.toString() ?? '',
    title: document.title ?? '',
    slug: document.slug ?? '',
    content: document.content ?? '',
    description: document.description ?? '',
    category: {
      id: (document.category_id as any)?.toString() ?? '',
      name: (document as any).category?.name ?? '',
    },
    isActive: (document as any).isActive ?? true,
    createdAt: document.createdAt ?? new Date(),
    updatedAt: document.updatedAt ?? new Date(),
  };
}
