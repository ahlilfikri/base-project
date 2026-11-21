"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createQueryClient } from "@/lib/query-client";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  // useState (bukan variabel modul) agar tiap pengunjung/request punya cache sendiri.
  const [queryClient] = React.useState(() => createQueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
