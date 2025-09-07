import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';

@Schema()
export class CategoryEntity extends Base {
  @Prop({ required: true })
  name: string;

  @Prop({
    unique: true,
    required: true,
  })
  slug: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: String,
    ref: PlatformEntity.name,
    unique: true,
    required: true,
  })
  platform_id: string;
}

export type CategoryDocument = CategoryEntity & Document;
export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);
CategorySchema.set('collection', COLLECTION_KEYS.CATEGORY);
