import { Status } from 'src/common';

export interface DataResponse {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  message: string;
  link?: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
