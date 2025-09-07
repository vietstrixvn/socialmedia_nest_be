import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PropertyStatus, PropertyType } from 'src/common';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';

@Schema({ timestamps: true })
export class PropertyEntity extends Base {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({
    type: [{ type: [String], ref: COLLECTION_KEYS.PLATFORM }],
    default: [],
  })
  platforms: Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(PropertyStatus),
    default: PropertyStatus.FREE,
  })
  property_status: PropertyStatus;

  @Prop({
    type: String,
    enum: Object.values(PropertyType),
    default: PropertyType.FREE,
  })
  property_type: PropertyType;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export type PropertyDocument = PropertyEntity & Document;

export const PropertySchema = SchemaFactory.createForClass(PropertyEntity);
PropertySchema.set('collection', COLLECTION_KEYS.PROPERTY);

// Updated indexes (removed owner-related indexes)
PropertySchema.index({ slug: 1 }, { unique: true });
PropertySchema.index({ property_status: 1 });
PropertySchema.index({ property_type: 1 });
PropertySchema.index({ isDeleted: 1 });
PropertySchema.index({ isActive: 1 });
PropertySchema.index({ tags: 1 });

// Virtual to get owner through junction table
PropertySchema.virtual('owner', {
  ref: 'UserPropertyEntity',
  localField: '_id',
  foreignField: 'propertyId',
  match: { role: 'owner', isActive: true },
  justOne: true,
  populate: { path: 'userId', select: 'firstName lastName username email' },
});

// Virtual to get all members through junction table
PropertySchema.virtual('members', {
  ref: 'UserPropertyEntity',
  localField: '_id',
  foreignField: 'propertyId',
  match: { isActive: true },
  populate: { path: 'userId', select: 'firstName lastName username email' },
});

// Virtual to get member count
PropertySchema.virtual('memberCount', {
  ref: 'UserPropertyEntity',
  localField: '_id',
  foreignField: 'propertyId',
  count: true,
  match: { isActive: true },
});

// Virtual to get platform count
PropertySchema.virtual('platformCount').get(function () {
  return this.platforms ? this.platforms.length : 0;
});

PropertySchema.virtual('postList', {
  ref: COLLECTION_KEYS.POST,
  localField: '_id',
  foreignField: 'propertyId',
});

PropertySchema.virtual('postCount', {
  ref: 'PostEntity',
  localField: '_id',
  foreignField: 'propertyId',
  count: true,
});

PropertySchema.virtual('scheduleCount', {
  ref: 'ScheduleEntity',
  localField: '_id',
  foreignField: 'propertyId',
  count: true,
});
