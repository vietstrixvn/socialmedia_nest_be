import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshAdminGuard extends AuthGuard('refresh-jwt') {}
