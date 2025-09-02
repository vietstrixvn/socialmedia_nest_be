import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Status } from 'src/common';
import { COLLECTION_KEYS } from 'src/database/collections';
import { Base } from './base.entity';

@Schema()
export class ContactEntity extends Base {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: String, required: false })
  phone_number: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, required: false })
  link: string;

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;
}

export type ContactDocument = ContactEntity & Document;
export const ContactSchema = SchemaFactory.createForClass(ContactEntity);
ContactSchema.set('collection', COLLECTION_KEYS.CONTACT);
