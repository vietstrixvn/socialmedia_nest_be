import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlatformDocument, PlatformEntity } from 'src/entities/platform.entity';
import { RedisCacheService } from '../cache/redis-cache.service';

import { StatusCode, StatusType } from 'src/common';
import { toFlatFormDataResponse } from 'src/mappers/platform.mapper';
import { UserData } from '../super_user/responses/user.interface';
import { CreatePlatformDto } from './dtos/create-flatform.dto';
import { CreateFlatformResponse } from './responses/create.response';
import { PlatformResponse } from './responses/data.response';

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  constructor(
    @InjectModel(PlatformEntity.name)
    private readonly platformModel: Model<PlatformDocument>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(): Promise<PlatformResponse[]> {
    const platforms = await this.platformModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    return platforms.map(toFlatFormDataResponse);
  }

  async create(
    createPlatformDto: CreatePlatformDto,
    user: UserData,
  ): Promise<CreateFlatformResponse> {
    const {
      name,
      supportsImages,
      supportsVideos,
      supportsText,
      maxTextLength,
      maxFileSize,
      supportedFormats,
    } = createPlatformDto;

    if (!name?.trim()) {
      throw new BadRequestException({ message: 'Name is required' });
    }

    const existingPlatform = await this.platformModel.findOne({ name });
    if (existingPlatform) {
      throw new BadRequestException({
        message: 'Platform with this name already exists',
      });
    }

    const newPlatform = new this.platformModel({
      name,
      supportsImages,
      supportsVideos,
      supportsText,
      maxTextLength,
      maxFileSize,
      supportedFormats,
      createdBy: {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
    });

    try {
      await this.redisCacheService.delByPattern('platforms*');
      const saved = await newPlatform.save();

      return {
        status: StatusType.Success,
        result: saved,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException({ message: 'Duplicate platform name' });
      }
      throw err;
    }
  }

  async validateFlatform(flatformId: string[]): Promise<boolean> {
    try {
      const count = await this.platformModel
        .countDocuments({
          _id: { $in: flatformId },
        })
        .exec();

      return count === flatformId.length;
    } catch (error) {
      this.logger.error(`Error validating services: ${error.message}`);
      return false;
    }
  }

  async update(
    _id: string,
    updateData: { name: string },
    user: UserData,
  ): Promise<PlatformDocument> {
    // Find existing category
    const category = await this.platformModel.findById(_id);
    if (!category) {
      throw new BadRequestException({
        statusCode: StatusCode.NotFound,
        message: 'erro',
        error: 'Not Found',
      });
    }

    // Validate input
    if (!updateData.name) {
      throw new BadRequestException({
        statusCode: StatusCode.BadRequest,
        message: 'erro',
        error: 'Bad Request',
      });
    }

    const normalizedName = updateData.name.trim();
    if (normalizedName === category.name) {
      return category;
    }

    // Check for duplicate name
    const existingCategory = await this.platformModel.findOne({
      _id: { $ne: _id },
      name: normalizedName,
    });

    if (existingCategory) {
      throw new BadRequestException({
        statusCode: StatusCode.Conflict,
        message: 'erro',
        error: 'Conflict',
      });
    }
    try {
      // Instead of directly assigning to updatedAt, use updateOne
      const updateResult = await this.platformModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            name: normalizedName,

            user: {
              id: user._id,
              username: user.username,
              role: user.role,
            },
          },
        },
        { new: true },
      );

      if (!updateResult) {
        throw new BadRequestException({
          statusCode: StatusCode.NotFound,
          message: 'erro',
          error: 'Not Found',
        });
      }

      await this.redisCacheService.reset();
      return updateResult;
    } catch (err) {
      if (err.code === 11000) {
        throw new BadRequestException({
          statusCode: StatusCode.Conflict,
          message: 'erro',
          error: 'Conflict',
        });
      }
      throw new BadRequestException({
        statusCode: StatusCode.ServerError,
        message: 'erro',
        error: 'Internal Server Error',
      });
    }
  }
}
