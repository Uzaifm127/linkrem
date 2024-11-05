"use client";

import React, { useCallback } from "react";
import {
  BadgeCheck,
  // Bell,
  ChevronRight,
  ChevronsUpDown,
  Command,
  // CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  // SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
import { sidebarPlatformItems } from "@/constants/array";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const AppSidebar = () => {
  const { data } = useSession();

  const pathname = usePathname();

  const onLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/auth/login" });
  }, []);

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <h3 className="truncate font-bold text-2xl">Linkrem</h3>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-4">
          <SidebarGroupLabel className="text-sm">Platform</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarPlatformItems.map((item) => {
              return (
                <SidebarMenuItem key={item.id}>
                  {item.items ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          className="cursor-pointer text-base transition"
                        >
                          <div>
                            <item.icon className="h-6 w-6" />
                            <span>{item.title}</span>

                            <ChevronRight className="ml-auto" />
                          </div>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white">
                        <DropdownMenuItem className="cursor-pointer">
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={item.url === pathname}
                      className="text-base transition"
                    >
                      <Link href={item.url!}>
                        <item.icon className="h-6 w-6" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="bg-accent-foreground/80 hover:bg-accent-foreground/90 text-text transition"
                asChild
              >
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-accent-foreground data-[state=open]:text-text"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={data?.user?.image ?? ""}
                      alt={data?.user?.name ?? ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {data?.user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {data?.user?.name}
                    </span>
                    <span className="truncate text-xs">
                      {" "}
                      {data?.user?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={data?.user?.image ?? ""}
                        alt={data?.user?.name ?? ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {data?.user?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data?.user?.name}
                      </span>
                      <span className="truncate text-xs">
                        {data?.user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem className="cursor-pointer">
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell />
                    Notifications
                  </DropdownMenuItem> */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
