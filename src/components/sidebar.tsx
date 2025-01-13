"use client";

import React, { useCallback, useState } from "react";
import {
  BadgeCheck,
  // Bell,
  ChevronRight,
  ChevronsUpDown,
  // CreditCard,
  LogOut,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarPlatformItems } from "@/constants/array";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { AllTagsAPIResponse } from "@/types/server/response";
import AppIcon from "@/components/ui/app-icon";
import { openLinks } from "@/lib/server-actions/open-links";
import { useAppStore } from "@/store";
import { tagQueryKey } from "@/constants/query-keys";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const { data } = useSession();

  const [clickedTag, setClickedTag] = useState("");
  const [tagOpeningLoading, setTagOpeningLoading] = useState(false);

  const { tagMutationLoading } = useAppStore();

  const pathname = usePathname();

  const tagQuery = useQuery({
    queryKey: [tagQueryKey],
    queryFn: async () => await fetcher("/api/tags"),
  });

  const tagData = tagQuery.data as AllTagsAPIResponse | undefined;

  const onLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/auth/login" });
  }, []);

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <AppIcon className="h-10 w-10" />

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
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 max-h-60 [scrollbar-width:none] overflow-y-scroll rounded-lg bg-white">
                        {/* Checking if length has a truthy value means other than 0 or have falsy value means 0 */}
                        {tagQuery.isLoading || !tagData?.tags?.length ? (
                          <div className="min-h-40 flex items-center justify-center w-full text-xl font-medium">
                            {tagQuery.isLoading ? (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <DotLottieReact
                                  className="h-40 w-40"
                                  src="/animations/tag-loader.lottie"
                                  loop
                                  autoplay
                                />
                              </div>
                            ) : (
                              "No Tags found"
                            )}
                          </div>
                        ) : (
                          tagData?.tags.map((tag) => (
                            <DropdownMenuItem
                              key={tag.id}
                              className={cn(
                                "cursor-pointer",
                                (tagMutationLoading || tagOpeningLoading) &&
                                  "cursor-not-allowed"
                              )}
                              onClick={async () => {
                                try {
                                  const linksStringArray = tag.links.map(
                                    (link) => link.url
                                  );

                                  setTagOpeningLoading(true);

                                  await openLinks(linksStringArray);
                                } catch (error) {
                                  console.error(error);
                                } finally {
                                  setClickedTag(tag.tagName);
                                  setTagOpeningLoading(false);
                                }
                              }}
                              disabled={tagMutationLoading || tagOpeningLoading}
                            >
                              <Tag className="h-6 w-6" />
                              {tag.tagName}
                            </DropdownMenuItem>
                          ))
                        )}
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

        {/* Toast for loading of opening tag links */}
        <ToastProvider>
          <Toast
            className="justify-start pl-2 pr-4 pt-4 pb-4"
            open={tagOpeningLoading}
            onOpenChange={setTagOpeningLoading}
          >
            <DotLottieReact
              className="h-10 w-10"
              src="/animations/toast-loader.lottie"
              loop
              autoplay
              speed={3}
            />
            <div className="grid">
              <ToastTitle>Running</ToastTitle>
              <ToastDescription>
                Opening the links for {clickedTag} tag
              </ToastDescription>
            </div>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
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
                  <DropdownMenuItem className="cursor-pointer" disabled>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" disabled>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
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
