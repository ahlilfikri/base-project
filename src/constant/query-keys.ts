import type { NewsListQuery } from "@/types/news";

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (query: NewsListQuery) => [...newsKeys.lists(), query] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (id: string) => [...newsKeys.details(), id] as const,
};
