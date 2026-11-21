import { z } from "zod";
import { NEWS_CATEGORIES, NEWS_STATUSES } from "../../constant/news";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../constant/pagination";
import { baseListResponseSchema, baseResponseSchema } from "./api";

export const newsIdSchema = z.uuid({ error: "ID berita tidak valid" });

const imageUrlSchema = z.url({
  protocol: /^https?$/,
  error: "URL gambar harus diawali http:// atau https://",
});

export const newsInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(150, "Judul maksimal 150 karakter"),
  content: z.string().trim().min(10, "Isi berita minimal 10 karakter"),
  category: z.enum(NEWS_CATEGORIES, { error: "Kategori tidak valid" }),
  status: z.enum(NEWS_STATUSES, { error: "Status tidak valid" }),
  author: z
    .string()
    .trim()
    .min(2, "Nama penulis minimal 2 karakter")
    .max(80, "Nama penulis maksimal 80 karakter"),
  imageUrl: z
    .union([z.literal(""), imageUrlSchema])
    .nullish()
    .transform((value) => value || null),
});

export const newsSchema = newsInputSchema.extend({
  id: newsIdSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  q: z.string().trim().max(100).default(""),
  status: z.enum(NEWS_STATUSES).optional(),
  category: z.enum(NEWS_CATEGORIES).optional(),
});

export const newsResponseSchema = baseResponseSchema(newsSchema);

export const newsListResponseSchema = baseListResponseSchema(newsSchema);
