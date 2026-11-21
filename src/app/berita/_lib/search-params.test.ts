import { describe, expect, it } from "vitest";
import { buildNewsListHref, parseNewsSearchParams } from "./search-params";

describe("parseNewsSearchParams", () => {
  it("mengisi default saat kosong", () => {
    expect(parseNewsSearchParams({})).toEqual({ page: 1, limit: 10, q: "" });
  });

  it("mengambil nilai pertama dari array dan meng-coerce angka", () => {
    expect(parseNewsSearchParams({ page: ["3", "9"], q: "rupiah" })).toMatchObject({
      page: 3,
      q: "rupiah",
    });
  });

  it("membuang hanya parameter yang tidak valid, bukan seluruh query", () => {
    const result = parseNewsSearchParams({ page: "abc", limit: "999", status: "draft", q: "x" });
    expect(result).toEqual({ page: 1, limit: 10, q: "x", status: "draft" });
  });

  it("mengabaikan parameter tak dikenal dan string kosong", () => {
    expect(parseNewsSearchParams({ foo: "bar", q: "" })).toEqual({ page: 1, limit: 10, q: "" });
  });
});

describe("buildNewsListHref", () => {
  it("tidak menulis nilai default", () => {
    expect(buildNewsListHref({ page: 1, limit: 10, q: "" })).toBe("/berita");
  });

  it("menulis filter dan halaman non-default", () => {
    expect(buildNewsListHref({ page: 2, q: "abc", status: "draft", category: "ekonomi" })).toBe(
      "/berita?page=2&q=abc&status=draft&category=ekonomi",
    );
  });

  it("round-trip: parse(build(query)) menghasilkan query yang sama", () => {
    const query = { page: 3, limit: 20, q: "uji coba", status: "published" as const };
    const href = buildNewsListHref(query);
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(parseNewsSearchParams(params)).toEqual(query);
  });
});
