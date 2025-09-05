import { ScheduleDocument } from 'src/entities/schedule.entity';
import { ScheduleResponse } from 'src/modules/schedule/responses/data.response';

export function toScheduleDataResponse(
  schedule: ScheduleDocument,
): ScheduleResponse {
  let platformId: string;
  if (!schedule.platform_id) {
    throw new Error(`Schedule ${schedule._id} missing platform_id`);
  } else if (typeof schedule.platform_id === 'string') {
    platformId = schedule.platform_id;
  } else if ((schedule.platform_id as any)?._id) {
    platformId = (schedule.platform_id as any)._id.toString();
  } else {
    throw new Error(`Schedule ${schedule._id} has invalid platform_id`);
  }

  return {
    id: schedule._id?.toString() ?? '',
    post_id: schedule.post_id?.toString() ?? '',
    platform_id: platformId,
    credential_id: schedule.credential_id?.toString() ?? null,
    scheduled_at: schedule.scheduled_at,
    status: schedule.status,
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
