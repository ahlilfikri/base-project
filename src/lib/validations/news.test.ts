import { describe, expect, it } from "vitest";
import {
  newsIdSchema,
  newsInputSchema,
  newsListQuerySchema,
  newsListResponseSchema,
  newsSchema,
} from "./news";

const validInput = {
  title: "Judul berita",
  content: "Isi berita yang cukup panjang.",
  category: "teknologi",
  status: "draft",
  author: "Budi",
  imageUrl: "",
};

const validNews = {
  ...validInput,
  imageUrl: null,
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("newsInputSchema", () => {
  it("menerima input valid dan mengubah imageUrl kosong menjadi null", () => {
    const parsed = newsInputSchema.parse(validInput);
    expect(parsed.imageUrl).toBeNull();
  });

  it("menerima imageUrl http(s), termasuk localhost", () => {
    expect(
      newsInputSchema.parse({ ...validInput, imageUrl: "http://localhost:4000/a.png" }).imageUrl,
    ).toBe("http://localhost:4000/a.png");
    expect(
      newsInputSchema.safeParse({ ...validInput, imageUrl: "https://picsum.photos/200" }).success,
    ).toBe(true);
  });

  it.each(["javascript:alert(1)", "data:text/html,hi", "ftp://x.com/a.png", "bukan url"])(
    "menolak imageUrl berbahaya/tidak valid: %s",
    (imageUrl) => {
      expect(newsInputSchema.safeParse({ ...validInput, imageUrl }).success).toBe(false);
    },
  );

  it("menolak field di bawah/atas batas", () => {
    expect(newsInputSchema.safeParse({ ...validInput, title: "ab" }).success).toBe(false);
    expect(newsInputSchema.safeParse({ ...validInput, title: "x".repeat(151) }).success).toBe(false);
    expect(newsInputSchema.safeParse({ ...validInput, content: "pendek" }).success).toBe(false);
    expect(newsInputSchema.safeParse({ ...validInput, author: "a" }).success).toBe(false);
  });

  it("menolak kategori dan status di luar enum", () => {
    expect(newsInputSchema.safeParse({ ...validInput, category: "lain" }).success).toBe(false);
    expect(newsInputSchema.safeParse({ ...validInput, status: "archived" }).success).toBe(false);
  });

  it("menolak judul yang hanya spasi (trim)", () => {
    expect(newsInputSchema.safeParse({ ...validInput, title: "     " }).success).toBe(false);
  });
});

describe("newsIdSchema", () => {
  it("menerima UUID v4 dan menolak UUID seed buatan tangan serta path traversal", () => {
    expect(newsIdSchema.safeParse(crypto.randomUUID()).success).toBe(true);
    expect(newsIdSchema.safeParse("00000000-0000-0000-0000-000000000001").success).toBe(false);
    expect(newsIdSchema.safeParse("../admin").success).toBe(false);
    expect(newsIdSchema.safeParse("").success).toBe(false);
  });
});

describe("newsListQuerySchema", () => {
  it("mengisi default page=1, limit=10, q=''", () => {
    expect(newsListQuerySchema.parse({})).toEqual({ page: 1, limit: 10, q: "" });
  });

  it("meng-coerce string dari URL", () => {
    expect(newsListQuerySchema.parse({ page: "3", limit: "20" })).toMatchObject({
      page: 3,
      limit: 20,
    });
  });

  it("menolak limit > 50, page < 1, dan enum tidak valid", () => {
    expect(newsListQuerySchema.safeParse({ limit: "51" }).success).toBe(false);
    expect(newsListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(newsListQuerySchema.safeParse({ status: "x" }).success).toBe(false);
  });
});

describe("newsSchema / newsListResponseSchema", () => {
  it("menerima news valid dan menolak tanpa id/timestamp valid", () => {
    expect(newsSchema.safeParse(validNews).success).toBe(true);
    expect(newsSchema.safeParse({ ...validNews, id: "1" }).success).toBe(false);
    expect(newsSchema.safeParse({ ...validNews, createdAt: "kemarin" }).success).toBe(false);
  });

  it("menolak respons list yang tidak sesuai kontrak BaseResponse", () => {
    const metadata = {
      timestamp: "2026-11-21T00:00:00.000Z",
      code: 200,
      message: "OK",
    };
    const pagination = { page: 1, limit: 10, pages: 1, total: 1, totalItems: 1 };
    const valid = { metadata, data: [validNews], pagination };

    expect(newsListResponseSchema.safeParse(valid).success).toBe(true);
    // `errors` opsional
    expect(newsListResponseSchema.safeParse({ ...valid, errors: "x" }).success).toBe(true);
    // tanpa metadata / pagination
    expect(newsListResponseSchema.safeParse({ data: [validNews], pagination }).success).toBe(false);
    expect(newsListResponseSchema.safeParse({ metadata, data: [validNews] }).success).toBe(false);
    // bentuk lama {data, meta} tidak lagi diterima
    expect(
      newsListResponseSchema.safeParse({
        data: [validNews],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }).success,
    ).toBe(false);
    // item malformed
    expect(
      newsListResponseSchema.safeParse({ ...valid, data: [{ id: 1 }] }).success,
    ).toBe(false);
  });
});
