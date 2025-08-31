// src/middleware/jwt-cookie.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtCookieMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log(`JwtCookieMiddleware: ${req.method} ${req.path}`);

    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) return next(); // Không có thì bỏ qua

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      req.user = decoded; // Gắn user vào req nếu cần
    } catch (error) {
      console.error('❌ Invalid refresh token:', error.message);
      res.clearCookie('refresh_token');
    }

    return next(); // Luôn next
  }
}
