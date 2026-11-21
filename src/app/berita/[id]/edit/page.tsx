import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { newsIdSchema } from "@/lib/validations/news";
import { EditNewsForm } from "../../_components/edit-news-form";

export const metadata: Metadata = { title: "Ubah berita" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!newsIdSchema.safeParse(id).success) notFound();

  return (
    <>
      <PageHeader title="Ubah berita" description="Perbarui data berita." />
      <EditNewsForm id={id} />
    </>
  );
}
