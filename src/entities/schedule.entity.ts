import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { PostEntity } from './post.entity';
import { Status } from './system-log.entity';
import { UserEntity } from './user.entity';

@Schema()
export class ScheduleEntity extends Base {
  @Prop({ type: Types.ObjectId, ref: PostEntity.name, required: true })
  post_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PlatformEntity.name, required: true })
  platform_id: Types.ObjectId;

  @Prop({ required: true })
  scheduled_at: Date;

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: false })
  created_by?: Types.ObjectId;

  @Prop({ default: 0 })
  attempts?: number;

  @Prop({ required: false })
  lastAttempt_at?: Date;
}

export type ScheduleDocument = ScheduleEntity & Document;
export const ScheduleSchema = SchemaFactory.createForClass(ScheduleEntity);
ScheduleSchema.set('collection', COLLECTION_KEYS.SCHEDULED);
