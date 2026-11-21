"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constant/routes";
import { useGetDetailNews, useUpdateNews } from "@/hooks/api/use-news";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { NewsForm } from "./news-form";

export function EditNewsForm({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, isPending, refetch } = useGetDetailNews(id);
  const updateNews = useUpdateNews();

  if (isPending) {
    return <Skeleton className="h-96 w-full max-w-2xl" aria-busy="true" />;
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
    <NewsForm
      key={data.updatedAt}
      submitLabel="Simpan perubahan"
      cancelHref={ROUTES.newsDetail(id)}
      defaultValues={{
        title: data.title,
        content: data.content,
        category: data.category,
        status: data.status,
        author: data.author,
        imageUrl: data.imageUrl ?? "",
      }}
      onSubmit={async (values) => {
        await updateNews.mutateAsync({ id, values });
        toast.success("Perubahan disimpan");
        router.replace(ROUTES.newsDetail(id));
      }}
    />
  );
}
