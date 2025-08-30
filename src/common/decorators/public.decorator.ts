import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IS_PUBLIC';
export const PublicRoute = () => SetMetadata(IS_PUBLIC_KEY, true);
