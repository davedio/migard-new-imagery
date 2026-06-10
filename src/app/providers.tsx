"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
// MotionProvider comes via motionConfig — the single source of truth for the
// motion preference (OS reduced-motion + manual toggle) AND the global
// MOTION_SPEED multiplier every scene applies at its frame boundary.
import { MotionProvider } from "@/lib/motionConfig";

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
