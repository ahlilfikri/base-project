import { beforeEach, describe, expect, it } from "vitest";
import {
  apiErrorResponseSchema,
  baseResponseSchema,
} from "../src/lib/validations/api";
import {
  newsListResponseSchema,
  newsResponseSchema,
} from "../src/lib/validations/news";
import { createApp } from "./app";

const validBody = {
  title: "Berita kontrak",
  content: "Isi berita untuk uji kontrak.",
  category: "teknologi",
  status: "published",
  author: "Penguji",
};

let handle: ReturnType<typeof createApp>;

const call = (path: string, init?: RequestInit) =>
  handle(new Request(`http://mock.test${path}`, init));

const sendJson = (path: string, method: string, body: unknown) =>
  call(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  handle = createApp();
});

// AC-11: respons mock server harus lolos schema yang dipakai klien (BaseResponse).
describe("kontrak mock server ↔ schema klien", () => {
  it("GET /news lolos newsListResponseSchema dan berbentuk BaseResponse", async () => {
    const response = await call("/news?limit=5");
    expect(response.status).toBe(200);
    const body = newsListResponseSchema.parse(await response.json());
    expect(body.metadata.code).toBe(200);
    expect(body.data).toHaveLength(5);
    expect(body.pagination).toMatchObject({ page: 1, limit: 5 });
    expect(body.pagination.total).toBe(body.pagination.totalItems);
  });

  it("POST/GET/PUT lolos newsResponseSchema; DELETE 204 lalu 404", async () => {
    const created = await sendJson("/news", "POST", validBody);
    expect(created.status).toBe(201);
    const { data, metadata } = newsResponseSchema.parse(await created.json());
    expect(metadata.code).toBe(201);

    expect((await call(`/news/${data.id}`)).status).toBe(200);

    const updated = await sendJson(`/news/${data.id}`, "PUT", {
      ...validBody,
      title: "Judul baru",
    });
    expect(updated.status).toBe(200);
    expect(newsResponseSchema.parse(await updated.json()).data.title).toBe(
      "Judul baru",
    );

    const removed = await call(`/news/${data.id}`, { method: "DELETE" });
    expect(removed.status).toBe(204);
    expect(await removed.text()).toBe("");

    const gone = await call(`/news/${data.id}`);
    expect(gone.status).toBe(404);
    expect(apiErrorResponseSchema.safeParse(await gone.json()).success).toBe(
      true,
    );
  });

  it("seed memakai UUID valid untuk z.uuid()", async () => {
    const { data } = newsListResponseSchema.parse(
      await (await call("/news?limit=50")).json(),
    );
    expect(data.length).toBeGreaterThan(0);
  });

  it("filter, pencarian, dan paginasi bekerja", async () => {
    const all = newsListResponseSchema.parse(
      await (await call("/news?limit=50")).json(),
    );
    const page2 = newsListResponseSchema.parse(
      await (await call("/news?limit=5&page=2")).json(),
    );
    expect(page2.pagination).toMatchObject({
      page: 2,
      limit: 5,
      total: all.pagination.total,
      totalItems: all.pagination.totalItems,
      pages: Math.ceil(all.pagination.totalItems / 5),
    });
    expect(page2.data).toHaveLength(5);

    const ekonomi = newsListResponseSchema.parse(
      await (await call("/news?category=ekonomi")).json(),
    );
    expect(ekonomi.data.every((n) => n.category === "ekonomi")).toBe(true);

    const search = newsListResponseSchema.parse(
      await (await call("/news?q=rupiah")).json(),
    );
    expect(search.data.length).toBeGreaterThanOrEqual(1);
  });

  it("hasil kosong: pages=0 dan data []", async () => {
    const empty = newsListResponseSchema.parse(
      await (await call("/news?q=tidak-akan-ditemukan-xyz")).json(),
    );
    expect(empty.data).toEqual([]);
    expect(empty.pagination).toMatchObject({ pages: 0, totalItems: 0 });
  });

  it("respons satu data tetap membawa pagination (BaseResponse mewajibkannya)", async () => {
    const list = newsListResponseSchema.parse(
      await (await call("/news?limit=1")).json(),
    );
    const detail = baseResponseSchema(newsResponseSchema.shape.data).parse(
      await (await call(`/news/${list.data[0].id}`)).json(),
    );
    expect(detail.pagination).toBeDefined();
  });
});

describe("validasi dan error (AC-7)", () => {
  it("422 dengan metadata.message dan `errors` berupa satu string", async () => {
    const response = await sendJson("/news", "POST", {
      ...validBody,
      title: "x",
      category: "zzz",
    });
    expect(response.status).toBe(422);
    const body = apiErrorResponseSchema.parse(await response.json());
    expect(body.metadata.message).toBe("Data tidak valid");
    expect(typeof body.errors).toBe("string");
    expect(body.errors).toContain("title:");
    expect(body.errors).toContain("category:");
  });

  it("respons gagal membawa metadata.code sama dengan status HTTP dan data null", async () => {
    const response = await call("/news/abc");
    const body = (await response.json()) as {
      metadata: { code: number };
      data: unknown;
    };
    expect(response.status).toBe(400);
    expect(body.metadata.code).toBe(400);
    expect(body.data).toBeNull();
  });

  it("400 untuk JSON rusak, 415 untuk bukan JSON, 413 untuk body besar", async () => {
    const broken = await call("/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{rusak",
    });
    expect(broken.status).toBe(400);

    const text = await call("/news", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "x",
    });
    expect(text.status).toBe(415);

    const big = await sendJson("/news", "POST", {
      ...validBody,
      content: "x".repeat(70_000),
    });
    expect(big.status).toBe(413);
  });

  it("400 untuk id bukan UUID dan limit > 50; 404 untuk id tak ada dan rute asing", async () => {
    expect((await call("/news/abc")).status).toBe(400);
    expect((await call("/news?limit=51")).status).toBe(400);
    expect((await call(`/news/${crypto.randomUUID()}`)).status).toBe(404);
    expect((await call("/admin")).status).toBe(404);
    expect((await call("/news/a/b")).status).toBe(404);
  });

  it("PUT dan DELETE pada id tak ada → 404", async () => {
    const id = crypto.randomUUID();
    expect((await sendJson(`/news/${id}`, "PUT", validBody)).status).toBe(404);
    expect((await call(`/news/${id}`, { method: "DELETE" })).status).toBe(404);
  });
});

describe("CORS", () => {
  it("OPTIONS → 204 dengan Allow-Methods dan Allow-Origin untuk origin sah", async () => {
    const response = await call("/news", {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3000" },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
      "PUT",
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
  });

  it("origin asing tidak mendapat Access-Control-Allow-Origin", async () => {
    const response = await call("/news", {
      headers: { Origin: "http://evil.example" },
    });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(response.headers.get("Vary")).toBe("Origin");
  });
});
