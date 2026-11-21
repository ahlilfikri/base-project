import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant/pagination";
import { ROUTES } from "@/constant/routes";
import { newsListQuerySchema } from "@/lib/validations/news";
import type { NewsListQuery } from "@/types/news";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Satu-satunya sumber default untuk server DAN klien, sehingga query key
 * hasil prefetch server sama persis dengan key di komponen klien.
 * Parameter yang tidak valid dibuang satu per satu (bukan membatalkan seluruh query).
 */
export function parseNewsSearchParams(raw: RawSearchParams): NewsListQuery {
  const input: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined && first !== "") input[key] = first;
  }

  for (let attempt = 0; attempt <= Object.keys(input).length; attempt++) {
    const result = newsListQuerySchema.safeParse(input);
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      delete input[String(issue.path[0])];
    }
  }
  return newsListQuerySchema.parse({});
}

/** Href daftar berita; nilai default tidak ditulis agar URL tetap bersih. */
export function buildNewsListHref(query: Partial<NewsListQuery>): string {
  const params = new URLSearchParams();
  if (query.page && query.page !== DEFAULT_PAGE) params.set("page", String(query.page));
  if (query.limit && query.limit !== DEFAULT_LIMIT) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.category) params.set("category", query.category);
  const qs = params.toString();
  return qs ? `${ROUTES.news}?${qs}` : ROUTES.news;
}
