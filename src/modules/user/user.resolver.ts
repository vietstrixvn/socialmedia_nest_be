import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from 'src/common/guard/gql.guard';
import { UserGraph } from 'src/models/user.model';
import { UserService } from './user.service';

@Resolver(() => UserGraph)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // ============================
  // Query: Get user profile
  // ============================
  @Query(() => UserGraph, { name: 'userProfile' })
  @UseGuards(GqlJwtAuthGuard)
  async getUserProfile(@Context() context: any): Promise<UserGraph> {
    // Lấy user ID từ JWT token trong context
    const userId = context.req.user.id;

    // Gọi service để lấy thông tin user
    const user = await this.userService.findOne(userId);

    // Transform MongoDB Document to UserGraph
    return this.transformToUserGraph(user);
  }

  // Helper method to transform MongoDB Document to UserGraph
  private transformToUserGraph(userDoc: any): UserGraph {
    return {
      _id: userDoc._id.toString(), // Convert ObjectId to string
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      username: userDoc.username,
      email: userDoc.email,
      phone_number: userDoc.phone_number,
      isActive: userDoc.isActive,
      isBlocked: userDoc.isBlocked,
      account_type: userDoc.account_type,
      provider: userDoc.provider,
      provider_id: userDoc.provider_id,
      verified: userDoc.verified,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      lastLogin: userDoc.lastLogin,
      avatar_url: userDoc.avatar_url,
      timezone: userDoc.timezone,
      isDeleted: userDoc.isDeleted || false,
      deletedAt: userDoc.deletedAt,
      // Computed field
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    } as UserGraph;
  }
}

// Alternative approach: Using class-transformer
// npm install class-transformer

/*
import { plainToClass } from 'class-transformer';

@Query(() => UserGraph, { name: 'userProfile' })
@UseGuards(GqlJwtAuthGuard)
async getUserProfile(
  @Context() context: any,
): Promise<UserGraph> {
  const userId = context.req.user.id;
  const user = await this.userService.findOne(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Using class-transformer (cleaner approach)
  return plainToClass(UserGraph, user.toObject(), {
    excludeExtraneousValues: false
  });
}
*/
