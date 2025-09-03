import { ScheduleDocument } from 'src/entities/schedule.entity';

export interface CreateScheduleResponse {
  status: string;
  result: ScheduleDocument;
}
