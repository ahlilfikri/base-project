export type Pagination = {
  page: number;
  limit: number;
  pages: number;
  total: number;
  totalItems: number;
};

export type BaseResponse<T> = {
  metadata: {
    timestamp: string;
    code: number;
    message: string;
  };
  data: T;
  pagination: Pagination;
  errors?: string;
};
