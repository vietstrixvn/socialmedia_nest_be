// entities/system-log.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.entity';
import { COLLECTION_KEYS } from 'src/database/collections';

export enum SystemLogType {
  UserStatistic = 'USER_STATISTIC',
  CreateManager = 'CREATE_MANAGER',
  DeletedUser = 'DELETED_USER',
  UpdateStatus = 'UPDATE_STATUS',
  SentMail = 'SENT_MAIL',

  // Contact
  DeletedContact = 'DELETED_CONTACT',

  // Blog
  BlogCreated = 'BLOG_CREATED',
  BlogUpdated = 'BLOG_UPDATED',
  BlogDeleted = 'BLOG_DELETED',

  // Category
  CategoryCreated = 'CATEGORY_CREATED',
  CategoryUpdated = 'CATEGORY_UPDATED',

  // Service
  ServiceCreated = 'SERVICE_CREATED',
  ServiceDeleted = 'SERVICE_DELETED',

  // Project
  ProjectCreated = 'PROJECT_CREATED',
  ProjectUpdated = 'PROJECT_UPDATED',
  ProjectDeleted = 'PROJECT_DELETED',

  // Seo
  SeoUpdated = 'SEO_UPDATED',
}

export enum Status {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Success = 'SUCCESS',
}

@Schema() // tương đương CreateDateColumn
export class SystemLog extends Base {
  @Prop({ enum: SystemLogType, required: true })
  type: SystemLogType;

  @Prop({ type: String })
  note: string;

  @Prop({ type: Object }) // lưu json
  data: Record<string, unknown>;

  loggedAt: Date; // auto gán từ timestamps
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);
SystemLogSchema.set('collection', COLLECTION_KEYS.SYSTEMLOGS);
