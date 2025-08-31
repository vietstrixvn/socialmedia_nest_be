// redis-client.provider.ts
import { Injectable, Logger, Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisClientProvider {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  createRedisClient(): Redis {
    if (!this.redisClient) {
      const redisHost = this.configService.get('REDIS_HOST', 'redis');
      const redisPort = this.configService.get('REDIS_PORT', 6380);
      const redisPassword = this.configService.get('REDIS_PASSWORD');
      const redisDb = this.configService.get('REDIS_INDEX', 0);

      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        db: redisDb,
      });

      this.redisClient.on('connect', () => {
        Logger.debug('Successfully connected to Redis!');
      });

      this.redisClient.on('error', (err) => {
        Logger.error('Redis connection error:', err);
      });
    }

    return this.redisClient;
  }
}

export const redisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    const redisHost = configService.get('REDIS_HOST', 'redis');
    const redisPort = configService.get('REDIS_PORT', 6379);
    const redisPassword = configService.get('REDIS_PASSWORD');
    const redisDb = configService.get('REDIS_INDEX', 0);

    const redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
    });

    redisClient.on('connect', () => {
      Logger.debug('[Redis] Successfully connected to Redis!');
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Redis connection error:', err);
    });

    return redisClient;
  },
  inject: [ConfigService],
};
