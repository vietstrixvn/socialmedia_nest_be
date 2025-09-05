import { Field, ObjectType } from '@nestjs/graphql';
import { PostGraph } from 'src/models/post.model';
import { PageInfo } from 'src/modules/paginate/pagination-schedule.model';

@ObjectType()
class PostEdge {
  @Field()
  cursor: string;

  @Field(() => PostGraph)
  node: PostGraph;
}

@ObjectType()
export class PaginationPostGraph {
  @Field(() => [PostEdge])
  edges: PostEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
