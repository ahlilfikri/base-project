import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constant/routes";
import { NewsList } from "./_components/news-list";
import {
  parseNewsSearchParams,
  type RawSearchParams,
} from "./_lib/search-params";

export const metadata: Metadata = { title: "Berita" };

// Halaman hanya membaca query URL; data diambil di sisi klien (TanStack Query).
export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const query = parseNewsSearchParams(await searchParams);

  return (
    <>
      <PageHeader
        title="Berita"
        description="Kelola berita: lihat, tambah, ubah, dan hapus."
        actions={
          <Button asChild>
            <Link href={ROUTES.newsNew}>Tambah berita</Link>
          </Button>
        }
      />
      <NewsList query={query} />
    </>
  );
}
