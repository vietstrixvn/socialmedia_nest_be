import { Status } from 'src/common';

export function buildContactFilter(params: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Record<string, any> {
  const { startDate, endDate, status } = params;
  const filter: Record<string, any> = {};

  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (status) {
    const statusArray = status.split(',');
    const validStatuses = statusArray.filter((s) =>
      Object.values(Status).includes(s as Status),
    );
    if (validStatuses.length > 0) {
      filter.status = { $in: validStatuses };
    }
  }

  return filter;
}
