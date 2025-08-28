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
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const searchShortcutEventHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();

        if (searchInputRef.current) {
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", searchShortcutEventHandler);

    return () =>
      window.removeEventListener("keydown", searchShortcutEventHandler);
  }, []);

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
              ref={searchInputRef}
              type="search"
              placeholder={
                globalSearch.type === "links"
                  ? "Search by link name or URLs"
                  : "Search by session name"
              }
              className="w-full bg-muted"
              onChange={(e) => {
                const searchText = e.target.value;

                if (globalSearch.type === "links") {
                  setGlobalSearch({ searchText, type: "links" });
                } else {
                  setGlobalSearch({ searchText, type: "sessions" });
                }
              }}
            />{" "}
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-[40vw] md:w-[35vw] lg:w-[30rem] max-sm:hidden relative">
        <div className="absolute top-1/2 -translate-y-1/2 right-[3%] text-xs p-1 rounded-sm text-muted-foreground">
          CTRL + K
        </div>

        <Input
          ref={searchInputRef}
          type="search"
          placeholder={
            globalSearch.type === "links"
              ? "Search by link name or URLs"
              : "Search by session name"
          }
          className="w-full bg-muted"
          onChange={(e) => {
            const searchText = e.target.value;

            if (globalSearch.type === "links") {
              setGlobalSearch({ searchText, type: "links" });
            } else {
              setGlobalSearch({ searchText, type: "sessions" });
            }
          }}
        />
      </div>

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
