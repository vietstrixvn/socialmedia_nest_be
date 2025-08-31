import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { PropertyStatus, PropertyType, UserRole } from 'src/common';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { UserEntity } from './user.entity';

@Schema()
export class PropertyEntity extends Base {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: false })
  description: string;

  @Prop({
    type: [String],
    ref: PlatformEntity.name,
    required: false,
  })
  platforms: Types.ObjectId[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: COLLECTION_KEYS.POST }] })
  posts: Types.ObjectId[];

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: COLLECTION_KEYS.SCHEDULED }],
  })
  schedules: Types.ObjectId[];

  @Prop({
    type: String,
    enum: PropertyStatus,
    default: PropertyStatus.FREE,
  })
  property_status!: PropertyStatus;

  @Prop({
    type: String,
    enum: PropertyType,
    default: PropertyType.FREE,
  })
  property_type!: PropertyType;

  @Prop({
    type: [
      {
        user: { type: SchemaTypes.ObjectId, ref: COLLECTION_KEYS.USER },
        role: {
          type: String,
          enum: [UserRole.Member, UserRole.Viewer],
        },
      },
    ],
  })
  members: { user: UserEntity | Types.ObjectId; role: UserRole }[];

  @Prop({ type: Object, required: true })
  owner: any;
}
export type PropertyDocument = PropertyEntity & Document;
export const PropertySchema = SchemaFactory.createForClass(PropertyEntity);
PropertySchema.set('collection', COLLECTION_KEYS.PROPERTY);

PropertySchema.index({ owner: 1, slug: 1 }, { unique: true });
