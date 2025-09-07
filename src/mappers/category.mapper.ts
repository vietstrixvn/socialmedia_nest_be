import { CategoryDocument } from 'src/entities/category.entity';
import { DataResponse } from 'src/modules/category/responses/data.response';

export function toCategoryDataResponse(
  category: Partial<CategoryDocument>,
): DataResponse {
  return {
    id: category._id?.toString() ?? '',
    name: category.name ?? '',
    slug: category.slug ?? '',
    isActive: category.isActive ?? true,
    platform_id: category.platform_id ?? '',
    createdAt: category.createdAt || new Date(),
    updatedAt: category.updatedAt || new Date(),
  };
}
