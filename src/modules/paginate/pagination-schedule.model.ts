import { Field, ObjectType } from '@nestjs/graphql';
import { ScheduleGraph } from 'src/models/schedule.model';

@ObjectType()
class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
class ScheduleEdge {
  @Field()
  cursor: string;

  @Field(() => ScheduleGraph)
  node: ScheduleGraph;
}

@ObjectType()
export class PaginationScheduleGraph {
  @Field(() => [ScheduleEdge])
  edges: ScheduleEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
