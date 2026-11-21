"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
  NEWS_STATUSES,
  NEWS_STATUS_LABELS,
} from "@/constant/news";
import type { NewsListQuery } from "@/types/news";
import { buildNewsListHref } from "../_lib/search-params";

const ALL = "all";
const SEARCH_DEBOUNCE_MS = 350;

export function NewsFilters({ query }: { query: NewsListQuery }) {
  const router = useRouter();
  const [search, setSearch] = useState(query.q);
  const latestQuery = useRef(query);

  useEffect(() => {
    latestQuery.current = query;
  }, [query]);

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === latestQuery.current.q) return;
    const timer = setTimeout(() => {
      router.replace(
        buildNewsListHref({ ...latestQuery.current, q: trimmed, page: 1 }),
        {
          scroll: false,
        },
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, router]);

  const apply = (patch: Partial<NewsListQuery>) =>
    router.replace(buildNewsListHref({ ...query, ...patch, page: 1 }), {
      scroll: false,
    });

  const hasFilter = Boolean(query.q || query.status || query.category);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cari judul atau isi…"
        aria-label="Cari berita"
        className="w-full sm:w-64"
      />

      <Select
        value={query.category ?? ALL}
        onValueChange={(value) =>
          apply({
            category:
              value === ALL ? undefined : (value as NewsListQuery["category"]),
          })
        }
      >
        <SelectTrigger aria-label="Filter kategori" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua kategori</SelectItem>
          {NEWS_CATEGORIES.map((value) => (
            <SelectItem key={value} value={value}>
              {NEWS_CATEGORY_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.status ?? ALL}
        onValueChange={(value) =>
          apply({
            status:
              value === ALL ? undefined : (value as NewsListQuery["status"]),
          })
        }
      >
        <SelectTrigger aria-label="Filter status" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua status</SelectItem>
          {NEWS_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {NEWS_STATUS_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter ? (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            router.replace(buildNewsListHref({ limit: query.limit }), {
              scroll: false,
            });
          }}
        >
          Reset
        </Button>
      ) : null}
    </div>
  );
}
