import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserStatus } from 'src/common';
import { Provider } from 'src/common/enums/provider.enum';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PropertyEntity } from './property.entity';

// Definition of User class
@Schema()
export class UserEntity extends Base {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  timezone?: string;

  @Prop({ default: () => new Date() })
  lastLogin: Date;

  @Prop({ unique: true, sparse: true })
  readonly username?: string;

  @Prop({ unique: true })
  readonly email!: string;

  @Prop()
  readonly phone_number!: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isBlocked!: boolean;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.FREE,
  })
  account_type!: UserStatus;

  @Prop({
    type: String,
    enum: Provider,
    default: Provider.Local,
  })
  provider!: Provider;

  @Prop({ required: false, select: false })
  providerId?: string;

  @Prop({
    type: [String],
    ref: PropertyEntity.name,
  })
  owned_properties: string[];

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: PropertyEntity.name }],
  })
  member_properties: PropertyEntity[] | Types.ObjectId[];

  // True in dev
  @Prop({ default: false })
  verified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
UserSchema.set('collection', COLLECTION_KEYS.USER);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await argon2.hash(this.password);
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  attempt: string,
): Promise<boolean> {
  if (!attempt || !this.password) return false; // nếu user social login thì auto false
  return argon2.verify(this.password, attempt);
};

export interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  username: string;
  email: string;
  phone_number: string;
  password?: string | null;
  lastLogin: Date;
  isActive: boolean;
  isBlocked: boolean;
  account_type: UserStatus;
  provider: Provider;
  providerId?: string;
  owned_properties: (string | Types.ObjectId)[];
  member_properties: (string | Types.ObjectId)[];
  comparePassword(attempt: string): Promise<boolean>;
}
