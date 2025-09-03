import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { addConditionalSelectHook } from '../utils/mongoose-helpers';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { PropertyEntity } from './property.entity';

@Schema()
export class CredentialEntity extends Base {
  @Prop({
    type: Types.ObjectId,
    ref: PlatformEntity.name,
    required: true,
  })
  platform: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PropertyEntity.name, required: true })
  property: Types.ObjectId;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ type: Object, ref: 'UserEntity', required: true })
  owner: any;

  @Prop({ required: false })
  apiSecret?: string;

  @Prop({ required: false })
  accessToken?: string;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({ required: false })
  expiresAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ required: false })
  lastUsedAt?: Date;
}

export type CredentialDocument = CredentialEntity & Document;
export const CredentialSchema = SchemaFactory.createForClass(CredentialEntity);
CredentialSchema.set('collection', COLLECTION_KEYS.CREDENTIAL);
CredentialSchema.index({ platform: 1, property: 1 }, { unique: true });

addConditionalSelectHook(CredentialSchema, [
  'apiKey',
  'apiSecret',
  'accessToken',
  'refreshToken',
]);
