"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorState
      message={error.message || "Terjadi kesalahan saat memuat halaman."}
      onRetry={retry}
    />
  );
}
