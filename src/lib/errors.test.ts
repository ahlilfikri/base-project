import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, getErrorStatus } from "./errors";

const config = { headers: {} } as InternalAxiosRequestConfig;

function responseError(status: number, data: unknown) {
  return new AxiosError(
    `status ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    { data, status, statusText: "", headers: {}, config },
  );
}

const errorBody = (code: number, message: string, errors?: string) => ({
  metadata: { timestamp: "2026-11-21T00:00:00.000Z", code, message },
  data: null,
  ...(errors ? { errors } : {}),
});

describe("getErrorStatus", () => {
  it("mengembalikan status dari respons server", () => {
    expect(getErrorStatus(responseError(404, {}))).toBe(404);
  });

  it("undefined bila tidak ada respons atau bukan error axios", () => {
    expect(
      getErrorStatus(new AxiosError("x", AxiosError.ERR_NETWORK, config)),
    ).toBeUndefined();
    expect(getErrorStatus(new Error("x"))).toBeUndefined();
    expect(getErrorStatus("x")).toBeUndefined();
  });
});

describe("getErrorMessage", () => {
  it("memakai metadata.message dari body error API", () => {
    const error = responseError(404, errorBody(404, "Berita tidak ditemukan"));
    expect(getErrorMessage(error)).toBe("Berita tidak ditemukan");
  });

  it("menambahkan `errors` (string) bila ada, mis. dari 422", () => {
    const error = responseError(
      422,
      errorBody(422, "Data tidak valid", "title: Judul minimal 3 karakter"),
    );
    expect(getErrorMessage(error)).toBe(
      "Data tidak valid: title: Judul minimal 3 karakter",
    );
  });

  it("fallback bila body bukan format error API", () => {
    expect(getErrorMessage(responseError(502, "<html>"))).toBe(
      "Permintaan gagal (502)",
    );
    expect(getErrorMessage(responseError(500, { error: "x" }))).toBe(
      "Permintaan gagal (500)",
    );
  });

  it("pesan khusus untuk gangguan jaringan, timeout, dan pembatalan", () => {
    const make = (code: string) => new AxiosError("x", code, config);
    expect(getErrorMessage(make(AxiosError.ERR_NETWORK))).toBe(
      "Tidak dapat terhubung ke server",
    );
    expect(getErrorMessage(make(AxiosError.ECONNABORTED))).toBe(
      "Permintaan ke server melebihi batas waktu",
    );
    expect(getErrorMessage(make(AxiosError.ERR_CANCELED))).toBe(
      "Permintaan dibatalkan",
    );
  });

  it("memakai message Error biasa, dan fallback untuk nilai lain", () => {
    expect(getErrorMessage(new Error("Respons tidak sesuai"))).toBe(
      "Respons tidak sesuai",
    );
    expect(getErrorMessage(undefined)).toBe(
      "Terjadi kesalahan yang tidak diketahui",
    );
  });
});
