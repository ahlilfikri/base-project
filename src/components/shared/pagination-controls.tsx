import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export function PaginationControls({
  page,
  totalPages,
  hrefForPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          {hasPrevious ? (
            <Button asChild variant="outline">
              <Link href={hrefForPage(page - 1)} scroll={false}>
                Sebelumnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Sebelumnya
            </Button>
          )}
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          {hasNext ? (
            <Button asChild variant="outline">
              <Link href={hrefForPage(page + 1)} scroll={false}>
                Berikutnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Berikutnya
            </Button>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
