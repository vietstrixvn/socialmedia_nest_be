import { registerAs } from '@nestjs/config';

export const appConfig = () => ({
  name: process.env.APP_NAME || 'MyApp',
  host: process.env.APP_HOST || 'localhost',
  port: parseInt(process.env.APP_PORT || '8080'),
  secret: process.env.APP_SECRET || 'secret',
  jwt: {
    secret: process.env.JWT_SECRET || 'jwtsecret',
    signOptions: {
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600'),
    },
  },
});
appConfig.KEY = 'app';
export type AppConfigType = ReturnType<typeof appConfig>;

export const setupConfig = registerAs('setup', () => ({
  port: parseInt(process.env.PORT ?? '8080', 10),
  env: process.env.NODE_ENV || 'local',
}));
export type SetupConfigType = ReturnType<typeof setupConfig>;

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_INDEX ?? '0', 10),
  ttl: parseInt(process.env.REDIS_TTL ?? '60', 10),
}));
