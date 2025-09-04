import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { PublishStatus } from 'src/modules/post/responses/data.response';
import { Base } from './base.entity';

@Schema()
export class ScheduleEntity extends Base {
  @Prop({ type: String, ref: COLLECTION_KEYS.POST, required: true })
  post_id: Types.ObjectId;

  @Prop({ type: String, ref: 'PlatformEntity', required: true })
  platform_id: string;

  @Prop({
    type: String,
    ref: 'CredentialEntity',
    required: false,
  })
  credential_id?: Types.ObjectId;

  @Prop({ required: true })
  scheduled_at: Date;

  @Prop({ enum: PublishStatus, default: PublishStatus.PENDING })
  status: PublishStatus;

  @Prop({ type: Types.ObjectId, ref: COLLECTION_KEYS.USER, required: false })
  owner?: Types.ObjectId;

  @Prop({ default: 0 })
  attempts?: number;

  @Prop({ required: false })
  lastAttempt_at?: Date;

  @Prop({ type: String, ref: COLLECTION_KEYS.PROPERTY, required: true })
  propertyId: Types.ObjectId;
}

export type ScheduleDocument = ScheduleEntity & Document;
export const ScheduleSchema = SchemaFactory.createForClass(ScheduleEntity);
ScheduleSchema.set('collection', COLLECTION_KEYS.SCHEDULED);

ScheduleSchema.index({ post_id: 1, platform_id: 1 }, { unique: true });
