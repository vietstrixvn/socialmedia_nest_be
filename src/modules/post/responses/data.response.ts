import { Types } from 'mongoose';
import { Status } from 'src/common';

export interface PublishResultResponse {
  platform: string; // platformId
  status: PublishStatus;
  publishedAt?: Date;
  platformPostId?: string;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  lastRetryAt?: Date;
}

export interface PostResponse {
  id: string;
  text: string;
  media_urls: string[];
  status: Status;
  created_by: string;
  created_at: Date;
  updated_at: Date;

  publishResults: PublishResultResponse[];

  successCount: number;
  failedCount: number;
  pendingCount: number;
  countAll: number;
}

export interface PublishResult {
  platform: Types.ObjectId;
  status: PublishStatus;
  publishedAt?: Date;
  platformPostId?: string; // ID của post trên platform (để có thể edit/delete sau)
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
  lastRetryAt?: Date;
}

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  PARTIAL = 'partial', // Một số platform thành công, một số thất bại
}
export enum PublishStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying',
}
