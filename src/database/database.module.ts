import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('DATABASE_URL');
        Logger.log(`👉 DATABASE_URL = ${uri}`, 'Config');

        return {
          uri,
          connectionFactory: (connection) => {
            Logger.log('✅ MongoDB connection successful!', 'Mongoose');
            Logger.log(
              `📦 Connected to DB: ${connection.db.databaseName}`,
              'Mongoose',
            );

            connection.on('error', (err) => {
              Logger.error(
                `❌ MongoDB connection error: ${err}`,
                '',
                'Mongoose',
              );
            });

            connection.on('disconnected', () => {
              Logger.warn('⚠️ MongoDB disconnected', 'Mongoose');
            });

            return connection;
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
