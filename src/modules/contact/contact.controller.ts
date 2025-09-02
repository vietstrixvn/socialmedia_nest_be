import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
// import { SystemLogService } from '../system-log/system-log.service';
import { ContactStatus } from './contact.constant';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';

@Controller({ path: 'contact', version: '1' })
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private readonly contactService: ContactService,
    // private readonly systemLogService: SystemLogService, // inject SystemLogService ở đây
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getContacts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('status') status?: ContactStatus,
    @Query('page_size') page_size: number = 10,
  ): Promise<any> {
    this.logger.debug('Fetching contact with filters:', {
      startDate,
      endDate,
      page,
      page_size,
      status,
    });

    const options = {
      page,
      page_size,
    };

    // Pass all parameters including service to findAll
    return this.contactService.findAll(options, startDate, endDate, status);
  }

  @Post()
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createFaqDto: CreateContactDto) {
    const contact = await this.contactService.created(createFaqDto);

    // await this.systemLogService.log({
    //   type: SystemLogType.SentMail,
    //   note: `Contact form submitted by ${contact.result.name}`,
    //   status: Status.Success,
    //   data: {
    //     id: contact.result._id,
    //     name: contact.result.name,
    //     mail: contact.result.email,
    //     phone: contact.result.phone_number,
    //   },
    // });

    return contact;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Req() req,
  ) {
    const contact = await this.contactService.update(
      id,
      updateContactDto,
      req.user,
    );

    // await this.systemLogService.log({
    //   type: SystemLogType.UpdateStatus,
    //   note: `Contact status updated by ${req.user.username}`,
    //   status: Status.Success,
    //   data: {
    //     id: contact.result._id,
    //     status: contact.result.status,
    //     updatedBy: req.user.username,
    //   },
    // });

    return contact;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req) {
    await this.contactService.delete(id);

    // await this.systemLogService.log({
    //   type: SystemLogType.DeletedContact,
    //   note: `User ${req.user.name} deleted a contact`,
    //   status: Status.Success,
    //   data: {
    //     user: req.user,
    //     blogId: id,
    //   },
    // });

    return { message: 'Contact deleted successfully' };
  }
}
