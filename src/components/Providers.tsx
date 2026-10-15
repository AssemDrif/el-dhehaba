"use client";
// components/Providers.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1c1917",
            color: "#fafaf9",
            border: "1px solid #44403c",
            fontFamily: "var(--font-cairo)",
            direction: "rtl",
          },
          success: {
            iconTheme: { primary: "#f59e0b", secondary: "#1c1917" },
          },
        }}
      />
    </QueryClientProvider>
  );
}

