"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { MotionProvider } from "@/lib/motion";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <MotionProvider>{children}</MotionProvider>
    </QueryClientProvider>
  );
}
