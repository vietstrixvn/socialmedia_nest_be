import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { EmailModule } from '../../common/email/email.module';
import { ContactEntity, ContactSchema } from '../../entities/contact.entity';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactEntity.name, schema: ContactSchema },
    ]),
    RedisCacheModule,
    // EmailModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
