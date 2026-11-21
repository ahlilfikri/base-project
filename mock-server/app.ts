// Handler HTTP murni (Web Request/Response) agar bisa dites tanpa Bun.
import { z } from "zod";
import {
  newsIdSchema,
  newsInputSchema,
  newsListQuerySchema,
} from "../src/lib/validations/news";
import type { BaseResponse, Pagination } from "../src/types/base-response";
import { createSeed, type NewsRecord } from "./seed";

// Default: dev server Next di port 3000. Jika port itu terpakai, set mis.
// MOCK_ALLOWED_ORIGINS=http://localhost:3100 (pisahkan dengan koma).
const ALLOWED_ORIGINS = new Set(
  (process.env.MOCK_ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const MAX_BODY_BYTES = 64 * 1024;
const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";

// BaseResponse mewajibkan `pagination` di setiap respons; untuk data tunggal
// dipakai nilai tetap ini.
const SINGLE_PAGINATION: Pagination = {
  page: 1,
  limit: 1,
  pages: 1,
  total: 1,
  totalItems: 1,
};

export function createApp(initial: NewsRecord[] = createSeed()) {
  const store = new Map<string, NewsRecord>(initial.map((n) => [n.id, n]));

  function withCors(request: Request, response: Response): Response {
    const origin = request.headers.get("Origin");
    response.headers.set("Vary", "Origin");
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    return response;
  }

  function metadata(code: number, message: string) {
    return { timestamp: new Date().toISOString(), code, message };
  }

  function ok<T>(
    data: T,
    status: number,
    message: string,
    pagination: Pagination = SINGLE_PAGINATION,
  ): Response {
    const body: BaseResponse<T> = {
      metadata: metadata(status, message),
      data,
      pagination,
    };
    return Response.json(body, { status });
  }

  /** Respons gagal: `data` null, rincian (jika ada) dalam satu string `errors`. */
  function error(status: number, message: string, errors?: string): Response {
    return Response.json(
      {
        metadata: metadata(status, message),
        data: null,
        ...(errors ? { errors } : {}),
      },
      { status },
    );
  }

  async function readJsonBody(
    request: Request,
  ): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
    const contentType = request.headers.get("Content-Type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return {
        ok: false,
        response: error(415, "Content-Type harus application/json"),
      };
    }
    const declared = Number(request.headers.get("Content-Length") ?? 0);
    if (declared > MAX_BODY_BYTES) {
      return { ok: false, response: error(413, "Body terlalu besar") };
    }
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return { ok: false, response: error(413, "Body terlalu besar") };
    }
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch {
      return { ok: false, response: error(400, "Body bukan JSON yang valid") };
    }
  }

  /** Satu string: "field: pesan, pesan; field2: pesan". Error tingkat objek → `_form`. */
  function issuesToText(err: z.ZodError): string {
    const grouped = new Map<string, string[]>();
    for (const issue of err.issues) {
      const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
      grouped.set(key, [...(grouped.get(key) ?? []), issue.message]);
    }
    return [...grouped]
      .map(([key, messages]) => `${key}: ${messages.join(", ")}`)
      .join("; ");
  }

  function validationError(err: z.ZodError): Response {
    return error(422, "Data tidak valid", issuesToText(err));
  }

  function list(url: URL): Response {
    const parsed = newsListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return error(400, "Query tidak valid", issuesToText(parsed.error));
    }
    const { page, limit, q, status, category } = parsed.data;
    const needle = q.toLowerCase();

    const filtered = [...store.values()]
      .filter((n) => !status || n.status === status)
      .filter((n) => !category || n.category === category)
      .filter(
        (n) =>
          !needle ||
          n.title.toLowerCase().includes(needle) ||
          n.content.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const totalItems = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return ok(data, 200, "Berhasil mengambil daftar berita", {
      page,
      limit,
      pages: Math.ceil(totalItems / limit),
      // Asumsi: `total` dan `totalItems` sama-sama jumlah seluruh item.
      total: totalItems,
      totalItems,
    });
  }

  async function create(request: Request): Promise<Response> {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = newsInputSchema.safeParse(body.value);
    if (!parsed.success) return validationError(parsed.error);

    const now = new Date().toISOString();
    const record: NewsRecord = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    store.set(record.id, record);
    return ok(record, 201, "Berita berhasil ditambahkan");
  }

  async function update(request: Request, id: string): Promise<Response> {
    const existing = store.get(id);
    if (!existing) return error(404, "Berita tidak ditemukan");

    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = newsInputSchema.safeParse(body.value);
    if (!parsed.success) return validationError(parsed.error);

    const record: NewsRecord = {
      ...parsed.data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    store.set(id, record);
    return ok(record, 200, "Berita berhasil diperbarui");
  }

  async function route(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { method } = request;

    if (method === "OPTIONS") {
      const response = new Response(null, { status: 204 });
      response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
      response.headers.set("Access-Control-Max-Age", "600");
      return response;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] !== "news" || segments.length > 2) {
      return error(404, "Rute tidak ditemukan");
    }

    if (segments.length === 1) {
      if (method === "GET") return list(url);
      if (method === "POST") return create(request);
      return error(405, "Metode tidak diizinkan");
    }

    const idResult = newsIdSchema.safeParse(segments[1]);
    if (!idResult.success) return error(400, "ID berita tidak valid");
    const id = idResult.data;

    if (method === "GET") {
      const record = store.get(id);
      return record
        ? ok(record, 200, "Berhasil mengambil detail berita")
        : error(404, "Berita tidak ditemukan");
    }
    if (method === "PUT") return update(request, id);
    if (method === "DELETE") {
      // 204 tanpa body (tidak dibungkus BaseResponse).
      return store.delete(id)
        ? new Response(null, { status: 204 })
        : error(404, "Berita tidak ditemukan");
    }
    return error(405, "Metode tidak diizinkan");
  }

  return async function handle(request: Request): Promise<Response> {
    try {
      return withCors(request, await route(request));
    } catch {
      return withCors(request, error(500, "Terjadi kesalahan pada server"));
    }
  };
}
