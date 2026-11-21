"use client";

import Link from "next/link";
import {
  createDataTableColumnHelper,
  type DataTableColumnDef,
} from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constant/routes";
import { formatDateTime } from "@/lib/format";
import type { News } from "@/types/news";
import { CategoryBadge, StatusBadge } from "./news-badges";

type NewsColumnsOptions = {
  onDelete: (news: Pick<News, "id" | "title">) => void;
};

const columnHelper = createDataTableColumnHelper<News>();

export function getNewsColumns({
  onDelete,
}: NewsColumnsOptions): DataTableColumnDef<News>[] {
  return columnHelper.columns([
    columnHelper.accessor("title", {
      header: "Judul",
      meta: { className: "max-w-xs font-medium whitespace-normal" },
      cell: ({ row }) => (
        <Link
          href={ROUTES.newsDetail(row.original.id)}
          className="hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Kategori",
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    }),
    columnHelper.accessor("author", {
      header: "Penulis",
    }),
    columnHelper.accessor("createdAt", {
      header: "Dibuat",
      meta: { className: "whitespace-nowrap" },
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    }),
    columnHelper.display({
      id: "actions",
      header: "Aksi",
      meta: { className: "text-right whitespace-nowrap" },
      cell: ({ row }) => (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.newsEdit(row.original.id)}>Ubah</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() =>
              onDelete({ id: row.original.id, title: row.original.title })
            }
          >
            Hapus
          </Button>
        </>
      ),
    }),
  ]);
}
