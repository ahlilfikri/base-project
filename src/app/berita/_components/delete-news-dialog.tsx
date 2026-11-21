"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteNews } from "@/hooks/api/use-news";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import type { News } from "@/types/news";

type DeleteNewsDialogProps = {
  news: Pick<News, "id" | "title"> | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteNewsDialog({
  news,
  onClose,
  onDeleted,
}: DeleteNewsDialogProps) {
  const deleteNews = useDeleteNews();

  const confirm = () => {
    if (!news || deleteNews.isPending) return;
    deleteNews.mutate(news.id, {
      onSuccess: () => {
        toast.success("Berita dihapus");
        onClose();
        onDeleted?.();
      },
      onError: (error) => {
        if (getErrorStatus(error) === 404) {
          toast.info("Berita sudah tidak ada");
          onClose();
          onDeleted?.();
          return;
        }
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <ConfirmDialog
      open={news !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Hapus berita?"
      description={
        news
          ? `“${news.title}” akan dihapus permanen dan tidak dapat dikembalikan.`
          : ""
      }
      isPending={deleteNews.isPending}
      onConfirm={confirm}
    />
  );
}
