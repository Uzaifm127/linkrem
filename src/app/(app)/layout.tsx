import React from "react";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/app-header";
import "@/styles/globals.css";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar />

      <main className="w-full relative">
        <AppHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}
