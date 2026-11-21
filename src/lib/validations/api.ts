import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  pages: z.number().int().min(0),
  total: z.number().int().min(0),
  totalItems: z.number().int().min(0),
});

export const metadataSchema = z.object({
  timestamp: z.string(),
  code: z.number().int(),
  message: z.string(),
});

export const baseResponseSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    metadata: metadataSchema,
    data,
    pagination: paginationSchema,
    errors: z.string().optional(),
  });

export const baseListResponseSchema = <T extends z.ZodType>(item: T) =>
  baseResponseSchema(z.array(item));

export const apiErrorResponseSchema = z.object({
  metadata: z.object({ message: z.string() }),
  errors: z.string().optional(),
});

export function parseResponse<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Respons server tidak sesuai kontrak API");
  }
  return parsed.data;
}
