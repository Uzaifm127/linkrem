"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useExtensionAuthenticate } from "@/hooks/use-extension-authenticate";

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  // For sending the authentication status to the extension
  useExtensionAuthenticate();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // This is to prevent the immediate refetch in SSR.
        staleTime: 1000 * 60 * 60 * 24,
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
