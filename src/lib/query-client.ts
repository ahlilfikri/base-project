import { QueryClient } from "@tanstack/react-query";
import { getErrorStatus } from "@/lib/errors";

// Nilai dasar mengikuti tutoria.id/admin (staleTime 1 menit, gcTime 5 menit,
// retry 1, tanpa refetch saat window focus).
const STALE_TIME_MS = 1 * 60 * 1000;
const GC_TIME_MS = 5 * 60 * 1000;
const MAX_RETRIES = 1;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        refetchOnWindowFocus: false,
        // Penyimpangan dari referensi (`retry: 1`): 4xx tidak diulang karena
        // itu kesalahan klien/data; mengulang tidak akan mengubah hasilnya.
        retry: (failureCount, error) => {
          const status = getErrorStatus(error);
          if (status !== undefined && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < MAX_RETRIES;
        },
      },
    },
  });
}
