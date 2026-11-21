import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import {
  createNews,
  deleteNews,
  getDetailNews,
  getListNews,
  updateNews,
} from "./news.service";

const id = crypto.randomUUID();
const news = {
  id,
  title: "Judul berita",
  content: "Isi berita yang cukup panjang.",
  category: "nasional",
  status: "published",
  author: "Budi",
  imageUrl: null,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
};
const validInput = {
  title: "Judul berita",
  content: "Isi berita yang cukup panjang.",
  category: "nasional",
  status: "draft",
  author: "Budi",
} as const;

const pagination = { page: 1, limit: 10, pages: 1, total: 1, totalItems: 1 };

/** Bungkus `data` ke bentuk BaseResponse (metadata + data + pagination). */
const wrap = (data: unknown, extra: Record<string, unknown> = {}) => ({
  metadata: {
    timestamp: "2026-11-21T00:00:00.000Z",
    code: 200,
    message: "OK",
  },
  data,
  pagination,
  ...extra,
});

const errorBody = (code: number, message: string, errors?: string) => ({
  metadata: { timestamp: "2026-11-21T00:00:00.000Z", code, message },
  data: null,
  ...(errors ? { errors } : {}),
});

const originalAdapter = api.defaults.adapter;
let adapter: ReturnType<typeof vi.fn<AxiosAdapter>>;

/** Adapter palsu: meniru perilaku axios (status di luar 2xx → AxiosError). */
function respondWith(status: number, data?: unknown) {
  adapter = vi.fn<AxiosAdapter>(async (config: InternalAxiosRequestConfig) => {
    const response: AxiosResponse = {
      data,
      status,
      statusText: "",
      headers: {},
      config,
    };
    if (status >= 200 && status < 300) return response;
    throw new AxiosError(
      `status ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response,
    );
  });
  api.defaults.adapter = adapter;
}

const lastConfig = () => adapter.mock.calls[0][0];

beforeEach(() => respondWith(200, wrap(news)));
afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

describe("getListNews", () => {
  it("mengirim query default dan membuang filter kosong", async () => {
    respondWith(200, wrap([news]));
    const res = await getListNews({});
    expect(res.pagination).toEqual(pagination);
    expect(lastConfig().url).toBe("/news");
    expect(lastConfig().params).toEqual({
      page: 1,
      limit: 10,
      q: undefined,
      status: undefined,
      category: undefined,
    });
  });

  it("meneruskan filter dan pencarian", async () => {
    respondWith(200, wrap([news]));
    await getListNews({ page: 2, q: "ekonomi", status: "draft" });
    expect(lastConfig().params).toMatchObject({
      page: 2,
      q: "ekonomi",
      status: "draft",
    });
  });

  it("respons list tanpa metadata/pagination → error kontrak", async () => {
    respondWith(200, { data: [news] });
    await expect(getListNews({})).rejects.toThrow("tidak sesuai kontrak");
  });

  it("respons dengan bentuk lama ({data, meta}) ditolak", async () => {
    respondWith(200, {
      data: [news],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    await expect(getListNews({})).rejects.toThrow("tidak sesuai kontrak");
  });

  it("limit > 50 ditolak sebelum request dikirim", async () => {
    await expect(getListNews({ limit: 51 })).rejects.toThrow();
    expect(adapter).not.toHaveBeenCalled();
  });
});

describe("getDetailNews", () => {
  it("mengembalikan data tervalidasi dan memanggil endpoint detail", async () => {
    const res = await getDetailNews(id);
    expect(res.data).toMatchObject({ id, title: "Judul berita" });
    expect(lastConfig().url).toBe(`/news/${id}`);
  });

  it("menolak id yang bukan UUID (mencegah path traversal ke endpoint lain)", async () => {
    for (const bad of ["../admin", "a/b", `${id}?x=1`, ""]) {
      await expect(getDetailNews(bad)).rejects.toThrow();
    }
    expect(adapter).not.toHaveBeenCalled();
  });

  it("respons malformed → error kontrak", async () => {
    respondWith(200, wrap({ id: 123 }));
    await expect(getDetailNews(id)).rejects.toThrow("tidak sesuai kontrak");
  });

  it("404 → AxiosError dengan status asli dan pesan dari metadata", async () => {
    respondWith(404, errorBody(404, "Berita tidak ditemukan"));
    const error = await getDetailNews(id).catch((e: unknown) => e);
    expect(getErrorStatus(error)).toBe(404);
    expect(getErrorMessage(error)).toBe("Berita tidak ditemukan");
  });
});

describe("createNews / updateNews", () => {
  it("create: POST body tervalidasi", async () => {
    respondWith(201, wrap(news));
    await createNews({ ...validInput, imageUrl: "" });
    expect(lastConfig().method).toBe("post");
    expect(lastConfig().url).toBe("/news");
    expect(JSON.parse(lastConfig().data)).toMatchObject({
      title: "Judul berita",
      imageUrl: null,
    });
  });

  it("create: input invalid ditolak SEBELUM request dikirim", async () => {
    await expect(
      createNews({ ...validInput, title: "x", content: "y" }),
    ).rejects.toThrow();
    expect(adapter).not.toHaveBeenCalled();
  });

  it("create: 422 membawa status dan pesan gabungan metadata.message + errors", async () => {
    respondWith(422, errorBody(422, "Data tidak valid", "title: Terlalu pendek"));
    const error = await createNews(validInput).catch((e: unknown) => e);
    expect(getErrorStatus(error)).toBe(422);
    expect(getErrorMessage(error)).toBe("Data tidak valid: title: Terlalu pendek");
  });

  it("update: PUT ke endpoint detail", async () => {
    await updateNews(id, validInput);
    expect(lastConfig().method).toBe("put");
    expect(lastConfig().url).toBe(`/news/${id}`);
  });
});

describe("deleteNews", () => {
  it("204 tanpa body dianggap sukses", async () => {
    respondWith(204);
    await expect(deleteNews(id)).resolves.toBeUndefined();
    expect(lastConfig().method).toBe("delete");
    expect(lastConfig().url).toBe(`/news/${id}`);
  });

  it("404 → AxiosError dengan status asli", async () => {
    respondWith(404, errorBody(404, "Berita tidak ditemukan"));
    const error = await deleteNews(id).catch((e: unknown) => e);
    expect(getErrorStatus(error)).toBe(404);
  });
});

describe("konfigurasi axios", () => {
  it("memakai baseURL dari env dan timeout", () => {
    expect(api.defaults.baseURL).toBe("http://127.0.0.1:4000");
    expect(api.defaults.timeout).toBeGreaterThan(0);
    vi.unstubAllEnvs();
  });
});
