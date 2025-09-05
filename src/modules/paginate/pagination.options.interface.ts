export interface PaginationOptionsInterface {
  page_size: number;
  page: number;
}

// src/paginate/pagination.options.input.ts
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class PaginationOptionsInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  page_size: number;
}

export class GraphPagination<T> {
  items: T[];
  total: number;
  total_page: number;
  page_size: number;
  current_page: number;

  constructor(partial: Partial<GraphPagination<T>>) {
    Object.assign(this, partial);
  }
}
