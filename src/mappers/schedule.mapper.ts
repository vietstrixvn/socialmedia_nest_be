import { ScheduleDocument } from 'src/entities/schedule.entity';
import { ScheduleResponse } from 'src/modules/schedule/responses/data.response';

export function toScheduleDataResponse(
  schedule: ScheduleDocument,
): ScheduleResponse {
  return {
    id: schedule._id?.toString() ?? '',
    post_id: schedule.post_id?.toString() ?? '',
    platform_id: (schedule.platform_id as any)?._id
      ? {
          id: (schedule.platform_id as any)._id.toString(),
          name: (schedule.platform_id as any).name,
        }
      : undefined,

    credential_id: schedule.credential_id?.toString() ?? null,
    scheduled_at: schedule.scheduled_at,
    status: schedule.status, // giữ string enum
    owner: schedule.owner
      ? {
          id: (schedule.owner as any)._id?.toString() ?? '',
          firstName: (schedule.owner as any).firstName ?? '',
          lastName: (schedule.owner as any).lastName ?? '',
          username: (schedule.owner as any).username ?? '',
          email: (schedule.owner as any).email ?? '',
        }
      : undefined,
    attempts: schedule.attempts ?? 0,
    lastAttempt_at: schedule.lastAttempt_at,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
    propertyId: schedule.propertyId?.toString() ?? '',
  };
}
