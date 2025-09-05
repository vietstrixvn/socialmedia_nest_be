import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PublishStatus } from 'src/modules/post/responses/data.response';

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
});

@ObjectType()
export class ScheduleGraph {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  post_id: string;

  @Field(() => String)
  platform_id: string;

  @Field(() => String, { nullable: true })
  credential_id?: string;

  @Field(() => String)
  scheduled_at: string;

  @Field(() => PublishStatus)
  status: PublishStatus;

  @Field(() => String, { nullable: true })
  owner?: string;

  @Field(() => Number, { nullable: true })
  attempts?: number;

  @Field(() => Date, { nullable: true })
  lastAttempt_at?: Date;

  @Field(() => String)
  propertyId: string;
}
