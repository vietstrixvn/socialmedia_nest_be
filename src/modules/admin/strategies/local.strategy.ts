// src/auth/strategies/local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminService } from 'src/modules/admin/admin.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy) {
  constructor(private adminService: AdminService) {
    super({
      usernameField: 'identifier',
    });
  }

  async validate(identifier: string, password: string) {
    if (!password) {
      throw new UnauthorizedException('Please provide a password');
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = await this.adminService.validateAdmin(
      normalizedIdentifier,
      password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
