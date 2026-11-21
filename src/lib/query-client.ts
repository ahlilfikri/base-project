import { QueryClient } from "@tanstack/react-query";
import { getErrorStatus } from "@/lib/errors";

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
