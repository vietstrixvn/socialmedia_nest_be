import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from 'src/common';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';

@Schema()
export class UserPropertyEntity extends Base {
  @Prop({ type: String, ref: 'PropertyEntity', required: true })
  propertyId: string;

  @Prop({ type: String, ref: 'UserEntity', required: true })
  userId: string;

  @Prop({ enum: UserRole, default: UserRole.Member })
  role: UserRole;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop({ type: Object })
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export type UserPropertyDocument = UserPropertyEntity & Document;
export const UserPropertySchema =
  SchemaFactory.createForClass(UserPropertyEntity);
UserPropertySchema.set('collection', COLLECTION_KEYS.USER_PROPERTY);

UserPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true });
UserPropertySchema.index({ userId: 1, role: 1 });
UserPropertySchema.index({ propertyId: 1, role: 1 });
UserPropertySchema.index({ joinedAt: -1 });
