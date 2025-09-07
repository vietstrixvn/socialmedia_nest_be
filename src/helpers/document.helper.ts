export function buildDocumentFilter(params: {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
}): Record<string, any> {
  const { startDate, endDate, status, category } = params;
  const filter: Record<string, any> = {};

  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (category) {
    filter.category = category;
  }

  return filter;
}
