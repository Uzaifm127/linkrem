"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // This is to prevent the immediate refetch in SSR.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster />
    </SessionProvider>
  );
};

export default Providers;
