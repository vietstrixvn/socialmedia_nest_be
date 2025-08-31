import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';
import { PlatformEntity } from './platform.entity';
import { PropertyEntity } from './property.entity';
import { UserEntity } from './user.entity';

@Schema()
export class CredentialEntity extends Base {
  @Prop({ type: Types.ObjectId, ref: PlatformEntity.name, required: true })
  platform: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PropertyEntity.name, required: true })
  property: Types.ObjectId;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name, required: false })
  owner?: Types.ObjectId;

  @Prop({ required: false })
  apiSecret?: string;

  @Prop({ required: false })
  accessToken?: string;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({ required: false })
  expiresAt?: Date;

  @Prop({ default: true })
  status: boolean;

  @Prop({ required: false })
  lastUsedAt?: Date;
}

export type CredentialDocument = CredentialEntity & Document;
export const CredentialSchema = SchemaFactory.createForClass(CredentialEntity);
CredentialSchema.set('collection', COLLECTION_KEYS.CREDENTIAL);
