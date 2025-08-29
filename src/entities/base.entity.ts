import { Prop } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

export abstract class Base {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ default: () => new Date() })
  readonly createdAt!: Date;

  @Prop({ default: () => new Date() })
  readonly updatedAt!: Date;
}
