import { ENDPOINTS } from "@/constant/endpoint";
import { api } from "@/lib/axios";
import { parseResponse } from "@/lib/validations/api";
import {
  newsIdSchema,
  newsInputSchema,
  newsListQuerySchema,
  newsListResponseSchema,
  newsResponseSchema,
} from "@/lib/validations/news";
import type { BaseResponse } from "@/types/base-response";
import type { News, NewsFormValues, NewsListQuery } from "@/types/news";

type TOptions = { signal?: AbortSignal };

export type TResponseListNews = BaseResponse<News[]>;
export type TResponseNews = BaseResponse<News>;

export async function getListNews(
  rawQuery: Partial<NewsListQuery> = {},
  { signal }: TOptions = {},
): Promise<TResponseListNews> {
  const { page, limit, q, status, category } =
    newsListQuerySchema.parse(rawQuery);
  const res = await api.get(ENDPOINTS.NEWS.LIST, {
    params: { page, limit, q: q || undefined, status, category },
    signal,
  });
  return parseResponse(newsListResponseSchema, res.data);
}

export async function getDetailNews(
  id: string,
  { signal }: TOptions = {},
): Promise<TResponseNews> {
  const res = await api.get(ENDPOINTS.NEWS.DETAIL(newsIdSchema.parse(id)), {
    signal,
  });
  return parseResponse(newsResponseSchema, res.data);
}

export async function createNews(
  values: NewsFormValues,
): Promise<TResponseNews> {
  const body = newsInputSchema.parse(values);
  const res = await api.post(ENDPOINTS.NEWS.CREATE, body);
  return parseResponse(newsResponseSchema, res.data);
}

export async function updateNews(
  id: string,
  values: NewsFormValues,
): Promise<TResponseNews> {
  const body = newsInputSchema.parse(values);
  const res = await api.put(
    ENDPOINTS.NEWS.UPDATE(newsIdSchema.parse(id)),
    body,
  );
  return parseResponse(newsResponseSchema, res.data);
}

export async function deleteNews(id: string): Promise<void> {
  await api.delete(ENDPOINTS.NEWS.DELETE(newsIdSchema.parse(id)));
}
