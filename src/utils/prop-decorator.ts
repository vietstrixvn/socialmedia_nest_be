import { Prop } from '@nestjs/mongoose';

/**
 * Custom decorator kết hợp Prop với conditional select
 */
export function SensitiveProp(options: any = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return Prop({
    ...options,
    select: isDevelopment ? true : false,
  });
}
