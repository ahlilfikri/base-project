"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constant/routes";
import { useGetListNews } from "@/hooks/api/use-news";
import { getErrorMessage } from "@/lib/errors";
import type { News, NewsListQuery } from "@/types/news";
import { buildNewsListHref } from "../_lib/search-params";
import { DeleteNewsDialog } from "./delete-news-dialog";
import { getNewsColumns } from "./news-columns";
import { NewsFilters } from "./news-filters";

export function NewsList({ query }: { query: NewsListQuery }) {
  const router = useRouter();
  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useGetListNews(query);
  const [toDelete, setToDelete] = useState<Pick<News, "id" | "title"> | null>(
    null,
  );

  const columns = useMemo(() => getNewsColumns({ onDelete: setToDelete }), []);

  const totalPages = data?.pagination.pages ?? 0;

  useEffect(() => {
    if (!data || isPlaceholderData) return;
    if (totalPages > 0 && query.page > totalPages) {
      router.replace(buildNewsListHref({ ...query, page: totalPages }), {
        scroll: false,
      });
    }
  }, [data, isPlaceholderData, totalPages, query, router]);

  const hasFilter = Boolean(query.q || query.status || query.category);

  let body: React.ReactNode;
  if (isPending) {
    body = (
      <div className="space-y-2" aria-busy="true" aria-label="Memuat berita">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  } else if (isError && !data) {
    body = (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  } else if (data && data.data.length === 0 && totalPages === 0) {
    body = (
      <EmptyState
        title={hasFilter ? "Tidak ada berita yang cocok" : "Belum ada berita"}
        description={
          hasFilter
            ? "Coba ubah atau reset filter."
            : "Mulai dengan menambahkan berita pertama."
        }
        action={
          !hasFilter ? (
            <Button asChild>
              <Link href={ROUTES.newsNew}>Tambah berita</Link>
            </Button>
          ) : undefined
        }
      />
    );
  } else if (data) {
    body = (
      <>
        <DataTable
          columns={columns}
          data={data.data}
          getRowId={(row) => row.id}
          className={
            isPlaceholderData || isFetching
              ? "opacity-70 transition-opacity"
              : undefined
          }
        />

        <p className="mt-3 text-sm text-muted-foreground">
          {data.pagination.totalItems} berita
        </p>
        <PaginationControls
          page={Math.min(query.page, Math.max(totalPages, 1))}
          totalPages={totalPages}
          hrefForPage={(page) => buildNewsListHref({ ...query, page })}
        />
      </>
    );
  }

  return (
    <div>
      <NewsFilters query={query} />
      {body}
      <DeleteNewsDialog news={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}
