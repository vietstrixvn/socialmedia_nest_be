// result.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { PostEntity } from './post.entity';

@Schema()
export class ResultEntity extends Base {
  @Prop({ type: Types.ObjectId, ref: PostEntity.name, required: true })
  post_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PlatformEntity.name, required: true })
  platform_id: Types.ObjectId;

  @Prop({ default: false })
  success: boolean;

  @Prop({ required: false })
  error?: string;
}

export type ResultDocument = ResultEntity & Document;
export const ResultSchema = SchemaFactory.createForClass(ResultEntity);
ResultSchema.set('collection', COLLECTION_KEYS.RESULT);
