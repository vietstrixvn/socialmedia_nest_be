import { Field, ObjectType } from '@nestjs/graphql';
import { ScheduleGraph } from 'src/models/schedule.model';
import { PageInfo } from 'src/modules/paginate/pagination-schedule.model';

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
