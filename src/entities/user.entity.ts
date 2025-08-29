import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Document } from 'mongoose';

import { Provider } from 'src/common/enums/provider.enum';
import { Role } from 'src/common/enums/role.enum';
import { Base } from './base.entity';

export type UserDocument = User & Document;

@Schema()
export class User extends Base {
  @Prop({ required: false })
  first_name?: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  username?: string;

  @Prop({ nullable: true })
  avatarUrl: string;

  @Prop()
  password: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.Manager,
  })
  role: Role;

  @Prop({
    type: String,
    enum: Provider,
    default: Provider.Local,
  })
  provider: Provider;

  @Prop({ required: false })
  providerId?: string;

  @Prop({ required: false })
  lastLoginAt?: Date;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('collection', 'users');

// Hash password trước khi save
UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await argon2.hash(this.password);
  }
  next();
});

// Thêm method comparePassword
UserSchema.methods.comparePassword = async function (
  attempt: string,
): Promise<boolean> {
  if (!attempt || !this.password) return false;
  return argon2.verify(this.password, attempt);
};
