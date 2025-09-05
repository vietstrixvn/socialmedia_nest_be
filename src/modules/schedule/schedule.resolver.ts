import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from 'src/common/guard/gql.guard';
import { ScheduleGraph } from 'src/models/schedule.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationScheduleGraph } from '../paginate/pagination-schedule.model';
import { PaginationOptionsInput } from '../paginate/pagination.options.interface';
import { UserLiteData } from '../user/responeses/user.response';
import { CreateScheduleInput } from './dtos/create-schedule.input';
import { CreateScheduleDto } from './dtos/create.dto';
import { ScheduleService } from './schedule.service';

@Resolver(() => ScheduleGraph)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ============================
  // Query: Lấy danh sách schedules theo post
  // ============================
  @Query(() => PaginationScheduleGraph, { name: 'schedulesByPost' })
  @UseGuards(GqlJwtAuthGuard)
  async getSchedulesByPost(
    @Args('options', { type: () => PaginationOptionsInput })
    options: PaginationOptionsInput,
    @Args('postId') postId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ) {
    const serviceOptions = {
      page: options.page,
      page_size: options.page_size,
    };

    const serviceResult = await this.scheduleService.graphFindByPost(
      serviceOptions,
      postId,
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
  // Query: Lấy danh sách schedules theo property
  // ============================
  @Query(() => PaginationScheduleGraph, { name: 'schedulesByProperty' })
  @UseGuards(GqlJwtAuthGuard)
  async getSchedulesByProperty(
    @Args('options') options: PaginationOptionsInput,
    @Args('propertyId') propertyId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ) {
    const serviceOptions = {
      page: options.page,
      page_size: options.page_size,
    };

    const serviceResult = await this.scheduleService.graphFindByProperty(
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
  // Mutation: Tạo schedule mới
  // ============================
  @Mutation(() => ScheduleGraph)
  @UseGuards(GqlJwtAuthGuard)
  async createSchedule(
    @Args('input') input: CreateScheduleInput,
    @CurrentUser() user: UserLiteData,
  ) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Ép kiểu GraphQL input sang DTO để service nhận type-safe
    const dto: CreateScheduleDto = {
      post_id: input.post_id,
      platform_id: input.platform_id!, // dấu ! vì mutation luôn cần field này
      scheduled_at: input.scheduled_at!, // dấu ! vì mutation luôn cần field này
    };

    const result = await this.scheduleService.create(dto, user);
    return result.result;
  }
}
