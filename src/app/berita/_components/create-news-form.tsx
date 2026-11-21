"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/constant/routes";
import { useCreateNews } from "@/hooks/api/use-news";
import { NewsForm } from "./news-form";

export function CreateNewsForm() {
  const router = useRouter();
  const createNews = useCreateNews();

  return (
    <NewsForm
      submitLabel="Simpan berita"
      onSubmit={async (values) => {
        const news = await createNews.mutateAsync(values);
        toast.success("Berita ditambahkan");
        router.replace(ROUTES.newsDetail(news.id));
      }}
    />
  );
}
