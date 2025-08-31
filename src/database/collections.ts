import * as dotenv from 'dotenv';
dotenv.config();

export const COLLECTION_KEYS = {
  POST: process.env.POST_COLLECTION || 'posts',
  PLATFORM: process.env.PLATFORM_COLLECTION || 'platforms',
  USER: process.env.USER_COLLECTION || 'users',
  SYSTEMLOGS: process.env.SYSTEMLOGS_COLLECTION || 'system_logs',
  SCHEDULED: process.env.SCHEDULED_TASK_COLLECTION || 'scheduled',
  RESULT: process.env.RESULT_TASK_COLLECTION || 'results',
  CREDENTIAL: process.env.CREDENTIAL_COLLECTION || 'credentials',
  SUPER_USER: process.env.SUPER_USER_COLLECTION || 'super_users',
  PROPERTY: process.env.PROPERTY_COLLECTION || 'properties',
};
