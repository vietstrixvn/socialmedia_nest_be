import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Status } from 'src/common';
import { PublishStatus } from 'src/modules/post/responses/data.response';

registerEnumType(Status, { name: 'Status' });
registerEnumType(PublishStatus, { name: 'PublishStatus' });

@ObjectType()
export class PublishResultGraph {
  @Field(() => String)
  platform: string;

  @Field(() => PublishStatus)
  status: PublishStatus;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => String, { nullable: true })
  platformPostId?: string;

  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @Field(() => String, { nullable: true })
  errorCode?: string;

  @Field(() => Number)
  retryCount: number;

  @Field(() => Date, { nullable: true })
  lastRetryAt?: Date;
}

@ObjectType()
export class PostGraph {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  text: string;

  @Field(() => [String], { nullable: true })
  media_urls?: string[];

  @Field(() => [String], { nullable: true })
  platforms?: string[];

  @Field(() => Status)
  status: Status;

  @Field(() => String, { nullable: true })
  created_by?: string;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => String)
  propertyId: string;

  @Field(() => [PublishResultGraph], { nullable: true })
  publishResults?: PublishResultGraph[];

  @Field(() => Number)
  successCount: number;

  @Field(() => Number)
  failedCount: number;

  @Field(() => Number)
  pendingCount: number;

  @Field(() => Number)
  countAll: number;

  @Field(() => String)
  overallPublishStatus: string;
}
