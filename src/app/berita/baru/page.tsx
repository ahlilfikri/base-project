import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CreateNewsForm } from "../_components/create-news-form";

export const metadata: Metadata = { title: "Tambah berita" };

export default function CreateNewsPage() {
  return (
    <>
      <PageHeader title="Tambah berita" description="Isi data berita baru." />
      <CreateNewsForm />
    </>
  );
}
