"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore } from "@/store";

const AppHeader = () => {
  const { setHeaderHeight, setGlobalSearch, globalSearch } = useAppStore();

  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (headerRef.current?.offsetHeight) {
      setHeaderHeight(headerRef.current?.offsetHeight);
    }
  }, [setHeaderHeight]);

  return (
    <header
      ref={headerRef}
      className="bg-white p-5 border-b flex justify-between items-center sticky top-0 left-0"
    >
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"ghost"}
              type="button"
              className="h-7 w-7 rounded-md"
              disabled
            >
              <Search className="h-5 w-5 text-text-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <Input
              type="search"
              placeholder="Search by link name or URLs"
              className="w-full bg-muted"
            />{" "}
          </PopoverContent>
        </Popover>
      </div>

      <Input
        type="search"
        placeholder={
          globalSearch.type === "link"
            ? "Search by link name or URLs"
            : "Search by session name"
        }
        className="w-[40vw] md:w-[35vw] lg:w-[30rem] max-sm:hidden bg-muted"
        onChange={(e) => {
          const searchText = e.target.value;

          if (globalSearch.type === "link") {
            setGlobalSearch({ searchText, type: "link" });
          } else {
            setGlobalSearch({ searchText, type: "session" });
          }
        }}
      />

      <div className="flex items-center gap-3">
        {/* <Button variant="outline" type="button">
          Get extension
        </Button>
        <Button type="button">Donate</Button> */}
      </div>
    </header>
  );
};

export default AppHeader;
