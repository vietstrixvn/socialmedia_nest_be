export interface ScheduleResponse {
  id: string;
  post_id: string;
  platform_id:
    | {
        id: string;
        name: string;
      }
    | undefined;
  property_id?: string;
  credential_id?: string | null;
  scheduled_at: Date;
  status: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  };
  propertyId: string;
  attempts: number;
  lastAttempt_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}
