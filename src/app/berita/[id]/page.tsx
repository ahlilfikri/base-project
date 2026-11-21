import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { newsIdSchema } from "@/lib/validations/news";
import { NewsDetailView } from "../_components/news-detail-view";

export const metadata: Metadata = { title: "Detail berita" };

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!newsIdSchema.safeParse(id).success) notFound();

  return <NewsDetailView id={id} />;
}
