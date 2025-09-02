import { Status } from 'src/common';
import { ContactDocument } from 'src/entities/contact.entity';
import { DataResponse } from 'src/modules/contact/responses/data.response';

export function toDataResponse(
  contact: Partial<ContactDocument>,
): DataResponse {
  return {
    id: contact._id?.toString() ?? '',
    name: contact.name ?? '',
    email: contact.email ?? '',
    phone_number: contact.phone_number ?? '',
    message: contact.message ?? '',
    link: contact.link ?? '',
    status: contact.status as Status,
    createdAt: contact.createdAt ?? new Date(),
    updatedAt: contact.updatedAt ?? new Date(),
  };
}
