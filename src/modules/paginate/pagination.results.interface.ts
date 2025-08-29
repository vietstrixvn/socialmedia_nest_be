export interface PaginationInterface {
  total_page: number;
  page_size: number | 10;
  page: number;
  total: number;
  previous: string | null;
  next: string | null;
}

export interface PaginationResultInterface<PaginationEntity> {
  results: PaginationEntity[];
  total: number;
  total_page: number;
  page_size: number;
  page: number;
}
