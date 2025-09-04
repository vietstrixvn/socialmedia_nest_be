import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import {
  PostStatus,
  PublishResult,
  PublishStatus,
} from 'src/modules/post/responses/data.response';
import { Base } from './base.entity';
import { Status } from './system-log.entity';

@Schema()
export class PostEntity extends Base {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], required: false })
  media_urls?: string[]; // lưu đường dẫn file thay vì object File

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: 'UserEntity', required: true })
  created_by: Types.ObjectId;

  @Prop({
    type: [
      {
        platform: { type: String, ref: 'PlatformEntity' },
        status: { type: String, enum: Object.values(PublishStatus) },
        publishedAt: { type: Date },
        platformPostId: { type: String },
        errorMessage: { type: String },
        errorCode: { type: String },
        retryCount: { type: Number, default: 0 },
        lastRetryAt: { type: Date },
      },
    ],
    default: [],
  })
  publishResults?: PublishResult[];

  @Prop({ required: false })
  publishedAt?: Date;

  @Prop({ type: String, ref: COLLECTION_KEYS.PROPERTY, required: true })
  propertyId: Types.ObjectId;
}

export type PostDocument = PostEntity & Document;
export const PostSchema = SchemaFactory.createForClass(PostEntity);
PostSchema.set('collection', COLLECTION_KEYS.POST);

PostSchema.index({ property: 1, status: 1 });
PostSchema.index({ created_by: 1, createdAt: -1 });
PostSchema.index({ scheduledAt: 1 });
PostSchema.index({ 'publishResults.platform': 1, 'publishResults.status': 1 });

PostSchema.virtual('overallPublishStatus').get(function () {
  if (!this.publishResults || this.publishResults.length === 0) {
    return 'not_started';
  }

  const results = this.publishResults;
  const successCount = results.filter(
    (r) => r.status === PublishStatus.SUCCESS,
  ).length;
  const failedCount = results.filter(
    (r) => r.status === PublishStatus.FAILED,
  ).length;
  const pendingCount = results.filter(
    (r) => r.status === PublishStatus.PENDING,
  ).length;

  if (successCount === results.length) return 'all_success';
  if (failedCount === results.length) return 'all_failed';
  if (pendingCount > 0) return 'in_progress';
  return 'partial_success';
});

// Methods
PostSchema.methods.updatePublishResult = function (
  platformId: Types.ObjectId,
  result: Partial<PublishResult>,
) {
  const existingIndex = this.publishResults.findIndex(
    (r: PublishResult) => r.platform.toString() === platformId.toString(),
  );

  if (existingIndex >= 0) {
    // Update existing result
    Object.assign(this.publishResults[existingIndex], result);
  } else {
    // Add new result
    this.publishResults.push({
      platform: platformId,
      status: PublishStatus.PENDING,
      retryCount: 0,
      ...result,
    });
  }

  // Update overall status based on publish results
  this.updateOverallStatus();
};

PostSchema.methods.updateOverallStatus = function () {
  const results = this.publishResults || [];

  if (results.length === 0) {
    this.status = PostStatus.DRAFT;
    return;
  }

  const successCount = results.filter(
    (r) => r.status === PublishStatus.SUCCESS,
  ).length;
  const failedCount = results.filter(
    (r) => r.status === PublishStatus.FAILED,
  ).length;
  const pendingCount = results.filter(
    (r) => r.status === PublishStatus.PENDING,
  ).length;

  if (pendingCount > 0) {
    this.status = PostStatus.PUBLISHING;
  } else if (successCount === results.length) {
    this.status = PostStatus.PUBLISHED;
    this.publishedAt = new Date();
  } else if (failedCount === results.length) {
    this.status = PostStatus.FAILED;
  } else {
    this.status = PostStatus.PARTIAL; // Một số thành công, một số thất bại
  }
};

PostSchema.virtual('successCount').get(function () {
  return (this.publishResults || []).filter(
    (r) => r.status === PublishStatus.SUCCESS,
  ).length;
});

PostSchema.virtual('failedCount').get(function () {
  return (this.publishResults || []).filter(
    (r) => r.status === PublishStatus.FAILED,
  ).length;
});

PostSchema.virtual('pendingCount').get(function () {
  return (this.publishResults || []).filter(
    (r) => r.status === PublishStatus.PENDING,
  ).length;
});

PostSchema.virtual('countAll').get(function () {
  return (this.publishResults || []).length;
});
