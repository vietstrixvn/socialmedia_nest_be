import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Document } from 'mongoose';
import { PermissionsData } from 'src/common/enums/permissions.enum';
import { COLLECTION_KEYS } from 'src/database/collections';
import { RolePermissionsMap } from 'src/maps/role-permission.map';
import { Role } from '../common';
import { Base } from './base.entity';

// Definition of Ssuper User class
@Schema()
export class SuperUserEntity extends Base {
  @Prop({ type: String, enum: Role, default: Role.Manager })
  readonly role!: Role;

  @Prop({ type: [String], enum: PermissionsData, default: [] })
  permissions!: PermissionsData[];

  @Prop()
  firstName!: string;

  @Prop()
  lastName!: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ unique: true, lowercase: true })
  readonly username: string;

  @Prop({ unique: true, lowercase: true })
  readonly email: string;

  @Prop({ unique: true })
  readonly phone_number!: string;

  @Prop()
  password!: string;

  @Prop()
  timezone?: string;

  @Prop({ default: () => new Date() })
  lastLogin: Date;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret?: string;

  // True in dev
  @Prop({ default: true })
  verified: boolean;

  @Prop()
  lockedUntil?: Date;
}

export const SuperUserSchema = SchemaFactory.createForClass(SuperUserEntity);
SuperUserSchema.set('collection', COLLECTION_KEYS.SUPER_USER);

SuperUserSchema.pre<SuperUserEntity & Document>('save', async function (next) {
  if (this.isModified('password')) {
    if (!this.password)
      return next(new Error('Password is required when modified'));
    this.password = await argon2.hash(this.password);
  }

  // 🚀 Gán permissions từ Role nếu chưa có hoặc role bị thay đổi
  if (this.isModified('role')) {
    this.permissions = RolePermissionsMap[this.role] || [];
  }

  next();
});

SuperUserSchema.methods.comparePassword = async function (
  this: SuperUserEntity & Document,
  attempt: string,
): Promise<boolean> {
  if (!attempt || !this.password) return false;
  return await argon2.verify(this.password, attempt);
};

export interface SuperUserDocument extends Document {
  _id: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  isActive: boolean;
  permissions: string[];
  comparePassword(attempt: string): Promise<boolean>;
}
