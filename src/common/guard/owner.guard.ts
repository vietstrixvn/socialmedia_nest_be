import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyDocument, PropertyEntity } from 'src/entities/property.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    @InjectModel(PropertyEntity.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const propertyId = request.params.id;

    if (!user || !user._id) {
      console.warn('🚨 OwnershipGuard: no user found in request');
      return false;
    }

    if (!propertyId) {
      console.warn('🚨 OwnershipGuard: no propertyId in request params');
      return false;
    }

    const property = await this.propertyModel.findById(propertyId).exec();

    if (!property) {
      console.warn(`🚨 OwnershipGuard: property ${propertyId} not found`);
      return false;
    }

    const isOwner = property.owner.toString() === user._id.toString();

    if (!isOwner) {
      console.warn(
        `🚨 OwnershipGuard: user ${user._id} is not owner of property ${property._id}`,
      );
    }

    return isOwner;
  }
}
