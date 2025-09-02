export function buildCredentialFilter(params: {
  startDate?: string;
  endDate?: string;
}): Record<string, any> {
  const { startDate, endDate } = params;
  const filter: Record<string, any> = {};

  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return filter;
}
