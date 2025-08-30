import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';

@Schema()
export class PlatformEntity extends Base {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: false })
  supportsImages: boolean;

  @Prop({ default: false })
  supportsVideos: boolean;

  @Prop({ default: false })
  supportsText: boolean;

  @Prop({ required: false })
  maxTextLength?: number;

  @Prop({ required: false })
  maxFileSize?: number;

  @Prop({ type: [String], required: false })
  supportedFormats?: string[];
}

export type PlatformDocument = PlatformEntity & Document;
export const PlatformSchema = SchemaFactory.createForClass(PlatformEntity);
PlatformSchema.set('collection', COLLECTION_KEYS.PLATFORM);
