import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RateLimitInfo } from 'src/types/types';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly windowMs = 5 * 1000;
  private readonly maxRequests = 10;
  private readonly ipStore = new Map<string, RateLimitInfo>();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = this.ipStore.get(ip);

    if (current?.banUntil && current.banUntil > now) {
      const retryAfter = Math.ceil((current.banUntil - now) / 1000);
      throw new HttpException(
        `Too many requests. Temporarily banned for ${retryAfter}s`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!current || current.expiresAt < now) {
      this.ipStore.set(ip, {
        count: 1,
        expiresAt: now + this.windowMs,
        violations: current?.violations || 0,
      });
    } else {
      current.count += 1;

      if (current.count > this.maxRequests) {
        current.violations += 1;

        const banTime = Math.min(
          2 ** current.violations * 1000,
          60 * 60 * 1000,
        );
        current.banUntil = now + banTime;
        current.count = 0;

        this.ipStore.set(ip, current);

        throw new HttpException(
          `Rate limit exceeded. IP temporarily banned for ${banTime / 1000}s`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      this.ipStore.set(ip, current);
    }

    next();
  }
}
