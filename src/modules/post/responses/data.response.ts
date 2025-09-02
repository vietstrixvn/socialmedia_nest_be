import { Status } from 'src/entities/system-log.entity';

export interface PostResponse {
  id: string;
  text: string;
  media_urls: string[];
  status: Status;
  created_by: string;
  platforms: string[];
  schedules: string[];
  attempts: number;
  lastAttempt_at?: Date;
  created_at: Date;
  updated_at: Date;
}
