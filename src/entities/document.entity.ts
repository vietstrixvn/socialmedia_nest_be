import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { CategoryEntity } from './category.entity';

@Schema()
export class DocumentEntity extends Base {
  @Prop({ required: true })
  title: string;

  @Prop({
    unique: true,
    required: true,
  })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  user: any;

  @Prop({ type: String, ref: CategoryEntity.name })
  category_id: CategoryEntity;
}
export type DocumentDocument = DocumentEntity & Document;
export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
DocumentSchema.set('collection', COLLECTION_KEYS.DOCUMENT);
