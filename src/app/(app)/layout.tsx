import React from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "@/styles/globals.css";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar />

      <main className="w-full">
        <header className="bg-white p-5 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"ghost"}
                  type="button"
                  className="h-7 w-7 rounded-md"
                >
                  <Search className="h-5 w-5 text-text-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Input
                  type="search"
                  placeholder="Search Link Name"
                  className="w-full bg-muted"
                />{" "}
              </PopoverContent>
            </Popover>
          </div>

          <Input
            type="search"
            placeholder="Search Link Name"
            className="w-[40vw] md:w-[35vw] lg:w-[30rem] max-sm:hidden bg-muted"
          />

          <div className="flex items-center gap-3">
            <Button variant="outline" type="button">Get extension</Button>
            <Button type="button">Donate</Button>
          </div>
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
}
