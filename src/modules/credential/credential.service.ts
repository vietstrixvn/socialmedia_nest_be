import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RedisCacheService } from '../cache/redis-cache.service';

import { StatusCode, StatusType } from 'src/common';
import {
  CredentialDocument,
  CredentialEntity,
} from 'src/entities/credential.entity';
import { PlatformService } from '../platform/platform.service';
import { PropertyService } from '../property/property.service';
import { UserLiteData } from '../user/responeses/user.response';
import { CreateCredentialDto } from './dtos/create.dto';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);

  constructor(
    @InjectModel(CredentialEntity.name)
    private readonly credentialModel: Model<CredentialDocument>,
    private readonly redisCacheService: RedisCacheService,
    private readonly platformService: PlatformService,
    private readonly propertyService: PropertyService,
  ) {}

  async create(
    createCredentialDto: CreateCredentialDto,
    user: UserLiteData,
  ): Promise<any> {
    const { platform, property, apiKey } = createCredentialDto;

    if (!apiKey?.trim()) {
      throw new BadRequestException({ message: 'apiKey is required' });
    }

    if (!platform)
      throw new BadRequestException({
        message: 'Error 3',
        code: StatusCode.BadRequest,
      });

    if (!property)
      throw new BadRequestException({
        message: 'Error 3',
        code: StatusCode.BadRequest,
      });

    const [platformExists, propertyExists] = await Promise.all([
      this.platformService.validateLimitPlarform(platform), // check platformId
      this.propertyService.validateProperty(property), // check propertyId
    ]);

    if (!platformExists) {
      throw new BadRequestException({
        message: 'Platform does not exist',
        code: StatusCode.BadRequest,
      });
    }

    if (!propertyExists) {
      throw new BadRequestException({
        message: 'Property does not exist',
        code: StatusCode.BadRequest,
      });
    }

    const existing = await this.credentialModel.findOne({
      platform,
      owner: user.id,
    });

    if (existing) {
      throw new BadRequestException({
        message: 'Credential for this platform already exists',
      });
    }

    const newCredential = new this.credentialModel({
      ...createCredentialDto,
      owner: user.id,
    });

    try {
      await this.redisCacheService.delByPattern('credential*');
      const saved = await newCredential.save();

      return {
        status: StatusType.Success,
        result: saved,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException({ message: 'Duplicate credential' });
      }
      throw err;
    }
  }

  async validateFlatform(flatformId: string[]): Promise<boolean> {
    try {
      const count = await this.credentialModel
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

  //   async update(
  //     _id: string,
  //     updateData: { name: string },
  //     user: UserData,
  //   ): Promise<PlatformDocument> {
  //     // Find existing category
  //     const category = await this.credentialModel.findById(_id);
  //     if (!category) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.NotFound,
  //         message: 'erro',
  //         error: 'Not Found',
  //       });
  //     }

  //     // Validate input
  //     if (!updateData.name) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.BadRequest,
  //         message: 'erro',
  //         error: 'Bad Request',
  //       });
  //     }

  //     const normalizedName = updateData.name.trim();
  //     if (normalizedName === category.name) {
  //       return category;
  //     }

  //     // Check for duplicate name
  //     const existingCategory = await this.platformModel.findOne({
  //       _id: { $ne: _id },
  //       name: normalizedName,
  //     });

  //     if (existingCategory) {
  //       throw new BadRequestException({
  //         statusCode: StatusCode.Conflict,
  //         message: 'erro',
  //         error: 'Conflict',
  //       });
  //     }
  //     try {
  //       // Instead of directly assigning to updatedAt, use updateOne
  //       const updateResult = await this.platformModel.findByIdAndUpdate(
  //         _id,
  //         {
  //           $set: {
  //             name: normalizedName,

  //             user: {
  //               id: user._id,
  //               username: user.username,
  //               role: user.role,
  //             },
  //           },
  //         },
  //         { new: true },
  //       );

  //       if (!updateResult) {
  //         throw new BadRequestException({
  //           statusCode: StatusCode.NotFound,
  //           message: 'erro',
  //           error: 'Not Found',
  //         });
  //       }

  //       await this.redisCacheService.reset();
  //       return updateResult;
  //     } catch (err) {
  //       if (err.code === 11000) {
  //         throw new BadRequestException({
  //           statusCode: StatusCode.Conflict,
  //           message: 'erro',
  //           error: 'Conflict',
  //         });
  //       }
  //       throw new BadRequestException({
  //         statusCode: StatusCode.ServerError,
  //         message: 'erro',
  //         error: 'Internal Server Error',
  //       });
  //     }
  //   }
}
