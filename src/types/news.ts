import type { z } from "zod";
import type {
  newsInputSchema,
  newsListQuerySchema,
  newsListResponseSchema,
  newsSchema,
} from "@/lib/validations/news";

export type NewsFormValues = z.input<typeof newsInputSchema>;
export type NewsInput = z.output<typeof newsInputSchema>;
export type News = z.output<typeof newsSchema>;
export type NewsListQuery = z.output<typeof newsListQuerySchema>;
export type NewsListResponse = z.output<typeof newsListResponseSchema>;
