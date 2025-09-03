import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Document } from 'mongoose';
import { UserStatus } from 'src/common';
import { Provider } from 'src/common/enums/provider.enum';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';

@Schema({ timestamps: true })
export class UserEntity extends Base {
  @Prop({ trim: true })
  firstName: string;

  @Prop({ trim: true })
  lastName: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  timezone?: string;

  @Prop({ default: () => new Date() })
  lastLogin: Date;

  @Prop({ unique: true, sparse: true })
  readonly username?: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  readonly email: string;

  @Prop()
  readonly phone_number?: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.FREE,
  })
  account_type: UserStatus;

  @Prop({
    type: String,
    enum: Object.values(Provider),
    default: Provider.Local,
  })
  provider: Provider;

  @Prop({ required: false, select: false })
  providerId?: string;

  @Prop({ default: false })
  verified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
UserSchema.set('collection', COLLECTION_KEYS.USER);

// Password hashing middleware
UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await argon2.hash(this.password);
  }
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (
  attempt: string,
): Promise<boolean> {
  if (!attempt || !this.password) return false;
  return argon2.verify(this.password, attempt);
};

// Virtual to get owned properties through junction table
UserSchema.virtual('ownedProperties', {
  ref: COLLECTION_KEYS.USER_PROPERTY,
  localField: '_id',
  foreignField: 'userId',
  match: { role: 'owner', isActive: true },
  populate: {
    path: 'propertyId',
    populate: { path: 'platforms', select: 'name type' },
  },
});

// Virtual to get member properties through junction table
UserSchema.virtual('memberProperties', {
  ref: COLLECTION_KEYS.USER_PROPERTY,
  localField: '_id',
  foreignField: 'userId',
  match: { role: { $ne: 'owner' }, isActive: true },
  populate: {
    path: 'propertyId',
    populate: { path: 'platforms', select: 'name type' },
  },
});

// Virtual to get all properties (owned + member)
UserSchema.virtual('allProperties', {
  ref: COLLECTION_KEYS.USER_PROPERTY,
  localField: '_id',
  foreignField: 'userId',
  match: { isActive: true },
  populate: { path: 'propertyId' },
});

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return (
    `${this.firstName || ''} ${this.lastName || ''}`.trim() ||
    this.username ||
    'Unknown'
  );
});

// Updated UserDocument interface
export interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  timezone?: string;
  username?: string;
  email: string;
  phone_number?: string;
  password?: string;
  lastLogin: Date;
  isActive: boolean;
  isBlocked: boolean;
  account_type: UserStatus;
  provider: Provider;
  providerId?: string;
  verified: boolean;
  fullName: string;
  comparePassword(attempt: string): Promise<boolean>;
}
