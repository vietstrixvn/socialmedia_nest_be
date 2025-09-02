import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { Status } from './system-log.entity';

@Schema()
export class PostEntity extends Base {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [Types.ObjectId], required: false })
  media_urls?: string[]; // lưu đường dẫn file thay vì object File

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: COLLECTION_KEYS.USER, required: true })
  created_by: Types.ObjectId;

  @Prop({ default: 0 })
  attempts?: number;

  @Prop({
    type: [Types.ObjectId],
    ref: PlatformEntity.name,
    required: false,
  })
  platforms: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: COLLECTION_KEYS.SCHEDULED })
  schedules?: Types.ObjectId[];

  @Prop({ required: false })
  lastAttempt_at?: Date;
}

export type PostDocument = PostEntity & Document;
export const PostSchema = SchemaFactory.createForClass(PostEntity);
PostSchema.set('collection', COLLECTION_KEYS.POST);

// // Trong PostEntity
// @Prop({
//   type: [{
//     platform: { type: Types.ObjectId, ref: COLLECTION_KEYS.PLATFORM },
//     status: { type: String, enum: ['pending', 'success', 'failed'] },
//     publishedAt: Date,
//     platformPostId: String, // ID của post trên platform
//     errorMessage: String
//   }]
// })
// publishResults?: Array<{
//   platform: Types.ObjectId;
//   status: 'pending' | 'success' | 'failed';
//   publishedAt?: Date;
//   platformPostId?: string;
//   errorMessage?: string;
// }>;
