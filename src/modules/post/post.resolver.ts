import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from 'src/common/guard/gql.guard';
import { PostGraph } from 'src/models/post.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationOptionsInput } from '../paginate/pagination.options.interface';
import { UserLiteData } from '../user/responeses/user.response';
import { CreatePostInput } from './dtos/create-post.input';
import { PostService } from './post.service';
import { PaginationPostGraph } from './responses/post.graph';

@Resolver(() => PostGraph)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  // ============================
  // Query: Get list of posts by property
  // ============================
  @Query(() => PaginationPostGraph, { name: 'postsByProperty' })
  @UseGuards(GqlJwtAuthGuard)
  async getPostByProperty(
    @Args('options') options: PaginationOptionsInput,
    @Args('propertyId') propertyId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ) {
    const serviceOptions = {
      page: options.page,
      page_size: options.page_size,
    };

    const serviceResult = await this.postService.graphFindByProperty(
      serviceOptions,
      propertyId,
      startDate,
      endDate,
    );

    const edges = serviceResult.items.map((node, index) => ({
      cursor: Buffer.from(
        `cursor:${(serviceOptions.page - 1) * serviceOptions.page_size + index}`,
      ).toString('base64'),
      node,
    }));

    const startCursor = edges.length > 0 ? edges[0].cursor : null;
    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    return {
      edges,
      pageInfo: {
        hasNextPage: serviceOptions.page < serviceResult.total_page,
        hasPreviousPage: serviceOptions.page > 1,
        startCursor,
        endCursor,
      },
    };
  }

  // ============================
  // Mutation: Create new psot
  // ============================
  @Mutation(() => PostGraph, { name: 'createPost' })
  @UseGuards(GqlJwtAuthGuard)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: UserLiteData,
  ) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const dto: CreatePostInput = {
      text: input.text,
      media_urls: input.media_urls || [],
      platforms: input.platforms || [],
      schedules: input.schedules || [],
      propertyId: input.propertyId!,
    };

    const result = await this.postService.create(dto, user);
    return result.result;
  }
}
