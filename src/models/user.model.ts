import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserStatus } from 'src/common';
import { Provider } from 'src/common/enums/provider.enum';

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account types',
});

registerEnumType(Provider, {
  name: 'Provider',
  description: 'Authentication providers',
});

@ObjectType()
export class UserGraph {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone_number?: string;

  // 🔒 NEVER expose password in GraphQL
  // password: string; // ← Commented out for security

  @Field()
  isActive: boolean;

  @Field()
  isBlocked: boolean;

  @Field(() => UserStatus)
  account_type: UserStatus;

  @Field(() => Provider)
  provider: Provider;

  @Field({ nullable: true })
  provider_id?: string;

  @Field()
  verified: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  lastLogin: Date;

  // Optional: Add computed fields
  @Field()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Field({ nullable: true })
  avatar_url?: string;

  @Field({ nullable: true })
  timezone?: string;

  // Add soft delete fields (recommended)
  @Field({ defaultValue: false })
  isDeleted?: boolean;

  @Field({ nullable: true })
  deletedAt?: Date;
}
