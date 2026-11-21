import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constant/routes";

export default function NotFound() {
  return (
    <EmptyState
      title="Halaman tidak ditemukan"
      description="Alamat yang Anda buka tidak ada atau sudah dipindahkan."
      action={
        <Button asChild>
          <Link href={ROUTES.news}>Kembali ke daftar berita</Link>
        </Button>
      }
    />
  );
}
