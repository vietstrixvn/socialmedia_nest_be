import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { ScheduleEntity } from './schedule.entity';
import { Status } from './system-log.entity';
import { UserEntity } from './user.entity';

@Schema()
export class PostEntity extends Base {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], required: false })
  media_urls?: string[]; // lưu đường dẫn file thay vì object File

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: true })
  created_by: Types.ObjectId;

  @Prop({ default: 0 })
  attempts?: number;

  @Prop({ type: [Types.ObjectId], ref: PlatformEntity.name, required: false })
  platforms?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: ScheduleEntity.name })
  schedules?: Types.ObjectId[];

  @Prop({ required: false })
  lastAttempt_at?: Date;
}

export type PostDocument = PostEntity & Document;
export const PostSchema = SchemaFactory.createForClass(PostEntity);
PostSchema.set('collection', COLLECTION_KEYS.POST);
