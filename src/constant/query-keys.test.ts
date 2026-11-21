import { describe, expect, it } from "vitest";
import { newsKeys } from "./query-keys";

describe("newsKeys", () => {
  it("semua key berawalan newsKeys.all agar invalidateQueries(all) mencakup semuanya", () => {
    const query = { page: 1, limit: 10, q: "" };
    expect(newsKeys.list(query).slice(0, 1)).toEqual(newsKeys.all);
    expect(newsKeys.detail("abc").slice(0, 1)).toEqual(newsKeys.all);
  });

  it("key list berbeda untuk query berbeda dan stabil untuk query sama", () => {
    const a = newsKeys.list({ page: 1, limit: 10, q: "" });
    const b = newsKeys.list({ page: 2, limit: 10, q: "" });
    expect(a).not.toEqual(b);
    expect(a).toEqual(newsKeys.list({ page: 1, limit: 10, q: "" }));
  });
});
