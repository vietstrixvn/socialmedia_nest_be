import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactDocument, ContactEntity } from '../../entities/contact.entity';

// Pagination
import { Pagination } from '../paginate/pagination';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';

import { StatusCode, StatusType } from 'src/entities/status_code.entity';
import { buildContactFilter } from 'src/helpers/contact.helper';
import { toDataResponse } from 'src/mappers/contact.mapper';
// import { EmailService } from '../../services/email.service';
import { buildCacheKey } from '../../utils/cache-key.util';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserLiteData } from '../user/responeses/user.response';
import {
  CONTACT_CACHE_TTL,
  ContactStatus,
  Error,
  Message,
} from './contact.constant';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';
import { CreateContactResponse } from './responses/create_contact.response';
import { DataResponse } from './responses/data.response';
import { UpdateContactResponse } from './responses/update_contact.respone';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(ContactEntity.name)
    private readonly contactModel: Model<ContactDocument>,
    // private readonly emailService: EmailService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(
    options: PaginationOptionsInterface,
    startDate?: string,
    endDate?: string,
    status?: ContactStatus,
    service?: string,
  ): Promise<Pagination<DataResponse>> {
    const cacheKey = buildCacheKey('contacts', {
      page: options.page,
      page_size: options.page_size,
      start: startDate,
      end: endDate,
      status: status || 'all',
      service: service || 'all',
    });

    const cached =
      await this.redisCacheService.get<Pagination<DataResponse>>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const filter = buildContactFilter({ startDate, endDate, status });

    const [contacts, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort({ createdAt: 'desc' }) // Changed to 'desc' for newest first
        .skip((options.page - 1) * options.page_size)
        .limit(options.page_size)
        .lean(),
      this.contactModel.countDocuments(filter),
    ]);

    const results = contacts.map(toDataResponse);
    const result = new Pagination<DataResponse>({
      results,
      total,
      total_page: Math.ceil(total / options.page_size),
      page_size: options.page_size,
      current_page: options.page,
    });

    await this.redisCacheService.set(
      cacheKey,
      result,
      CONTACT_CACHE_TTL.CONTACT_LIST,
    );
    return result;
  }

  async findOne(_id: string): Promise<ContactDocument> {
    const faq = await this.contactModel.findById(_id).lean().exec();
    if (!faq) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: Message.ContactNotFound,
        error: Error.CONTACT_NOT_FOUND,
      });
    }
    return faq;
  }

  async delete(_id: string): Promise<void> {
    const result = await this.contactModel.findByIdAndDelete(_id);
    if (result) {
      await this.redisCacheService.delByPattern('contacts*');
      await this.redisCacheService.del(`contacts_${_id}`);
    } else {
      // If the blog wasn't found, throw a clear error
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: Message.ContactNotFound,
        error: Error.CONTACT_NOT_FOUND,
      });
    }
  }

  async created(
    createContactDto: CreateContactDto,
  ): Promise<CreateContactResponse> {
    if (
      !createContactDto ||
      !createContactDto.name ||
      !createContactDto.email ||
      !createContactDto.message
    ) {
      throw new BadRequestException(Message.DataRequired);
    }
    const { phone_number, email, message, name } = createContactDto;
    // Initialize serviceId as undefined
    let serviceId: string | undefined;

    const newContact = new this.contactModel({
      name,
      email,
      phone_number,
      message,
      service: serviceId, // Use single service ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedContact = await newContact.save();

    // Sử dụng Promise.all để thực hiện gửi email và reset Redis song song
    // try {
    //   await Promise.all([
    //     this.emailService.sendThankYouEmail({
    //       recipientEmail: createContactDto.email,
    //       name: createContactDto.name,
    //     }),
    //     this.redisCacheService.delByPattern('contacts*'),
    //   ]);
    // } catch (error) {
    //   // Xử lý lỗi gửi email hoặc reset Redis nếu cần thiết
    //   console.error('Error occurred during async operations', error);
    // }

    return {
      status: StatusType.Success,
      result: savedContact,
    };
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    user: UserLiteData,
  ): Promise<UpdateContactResponse> {
    const contact = await this.contactModel.findById(id);
    if (!contact) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: Message.ContactNotFound,
        error: Error.CONTACT_NOT_FOUND,
      });
    }

    const updatedContact = await this.contactModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateContactDto,
            updatedAt: new Date(),
            user: {
              userId: user.id,
            },
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedContact) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: Message.ContactNotFound,
        error: Error.CONTACT_NOT_FOUND,
      });
    }
    await updatedContact.save();
    await this.redisCacheService.delByPattern('contacts*');
    await this.redisCacheService.del(`contacts_${id}`);
    return {
      status: StatusType.Success,
      result: updatedContact,
    };
  }
}
