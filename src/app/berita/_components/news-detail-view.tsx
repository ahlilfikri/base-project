"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constant/routes";
import { useGetDetailNews } from "@/hooks/api/use-news";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { DeleteNewsDialog } from "./delete-news-dialog";
import { CategoryBadge, StatusBadge } from "./news-badges";

export function NewsDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, isPending, refetch } = useGetDetailNews(id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Memuat berita">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) {
    const notFound = getErrorStatus(error) === 404;
    return (
      <ErrorState
        title={notFound ? "Berita tidak ditemukan" : undefined}
        message={getErrorMessage(error)}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={data.title}
        description={`Oleh ${data.author} · ${formatDateTime(data.createdAt)}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={ROUTES.newsEdit(data.id)}>Ubah</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmingDelete(true)}
            >
              Hapus
            </Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <CategoryBadge category={data.category} />
        <StatusBadge status={data.status} />
      </div>

      <Card>
        <CardContent className="space-y-4">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL gambar dari API bebas domain; next/image butuh remotePatterns
            <img
              src={data.imageUrl}
              alt={data.title}
              referrerPolicy="no-referrer"
              className="max-h-80 w-full rounded-lg object-cover"
            />
          ) : null}
          <p className="whitespace-pre-wrap leading-relaxed">{data.content}</p>
          <p className="text-xs text-muted-foreground">
            Diperbarui {formatDateTime(data.updatedAt)}
          </p>
        </CardContent>
      </Card>

      <DeleteNewsDialog
        news={confirmingDelete ? { id: data.id, title: data.title } : null}
        onClose={() => setConfirmingDelete(false)}
        onDeleted={() => router.replace(ROUTES.news)}
      />
    </div>
  );
}
