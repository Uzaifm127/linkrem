"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { X, Filter, Plus, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "@/components/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { LinkData, LinkForm, SessionForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema, sessionSchema } from "@/lib/zod-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import {
  AllLinksAPIResponse,
  AllSessionsAPIResponse,
} from "@/types/server/response";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { v4 as uuid } from "uuid";
import { useAppStore } from "@/store";
import {
  getTagQueryKey,
  linkQueryKey,
  sessionQueryKey,
} from "@/constants/query-keys";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { TagInput } from "@/components/ui/tag-input";
import { Tag } from "emblor";
import { tagParser } from "@/lib/functions";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { Session } from "@/components/session";
import { cn } from "@/lib/utils";
import ShortcutPicker from "@/components/shortcut-picker";
import { matchesShortcut, maxLinkShortcuts } from "@/lib/shortcut";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

type TabValueType = "links" | "sessions";

const LinksClient = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [tabValue, setTabValue] = useState<TabValueType>("links");
  const [selectedSessionLinkIds, setSelectedSessionLinkIds] = useState<
    Array<string>
  >([]);
  const [inputTags, setInputTags] = useState<Tag[]>([]);
  const [shortcut, setShortcut] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [filterChips, setFilterChips] = useState<
    Array<never> | Array<{ name: string; filterApplied: boolean }>
  >([]);

  const { data: session } = useSession();

  const {
    linkData,
    setLinkData,
    setSessionData,
    sessionData,
    setTagMutationLoading,
    headerHeight,
    tagsData,
    globalSearch,
    setGlobalSearch,
  } = useAppStore();

  const { toast } = useToast();

  const listData = useRef<ReactNode | null>(null);
  const tagSearchInputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();
  const currentTagQueryKey = getTagQueryKey(session?.user.id);

  // Querying for links
  const linkQuery = useQuery<AllLinksAPIResponse>({
    queryKey: [linkQueryKey],
    queryFn: async () => await fetcher("/api/link/my-links"),
    enabled: tabValue === "links",
    retry: false,
  });

  // Querying for sessions
  const sessionQuery = useQuery<AllSessionsAPIResponse>({
    queryKey: [sessionQueryKey],
    queryFn: async () => await fetcher("/api/session/my-sessions"),
    enabled: tabValue === "sessions",
  });

  const linkForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const { control, handleSubmit } = linkForm;

  const sessionForm = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      sessionLinks: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (linkDataObject: LinkData) =>
      await fetcher("/api/link", "POST", linkDataObject),

    async onMutate(newLink) {
      // Doing mutation for links but also disabling the tags
      setTagMutationLoading(true);

      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [linkQueryKey] }),
        queryClient.cancelQueries({ queryKey: currentTagQueryKey }),
      ]);

      // Getting the previous links
      const previousLinks = queryClient.getQueryData([linkQueryKey]);

      // Getting the previous tags associated with that link
      const previousTags = queryClient.getQueryData(currentTagQueryKey);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [linkQueryKey],
        (oldLinks: AllLinksAPIResponse | undefined) => {
          if (oldLinks) {
            const linkId = uuid();
            const now = new Date(new Date().toISOString());
            const tags = newLink.tags.map((tag) => ({
              id: uuid(),
              tagName: tag,
              locked: false,
              userId: session?.user.id || uuid(),
              createdAt: now,
              updatedAt: now,
            }));

            return {
              links: [
                ...oldLinks.links,
                {
                  id: linkId,
                  name: newLink.name,
                  url: newLink.url,
                  tags: tags || [],
                  shortcut: newLink.shortcut
                    ? {
                        id: uuid(),
                        shortcutKey: newLink.shortcut,
                        linkId,
                        createdAt: now,
                        updatedAt: now,
                      }
                    : null,
                  userId: session?.user.id || uuid(),
                  sessionLinksId: null,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
            };
          }
        },
      );

      setDialogOpen(false);
      linkForm.reset();
      setInputTags([]);
      // Closing dropdown after closing dialog
      setAddDropdownOpen(false);

      // Return the context with previous value
      return { previousLinks, previousTags };
    },

    onError(error, _newLink, context) {
      if (context) {
        toast({
          title:
            error instanceof Error ? error.message : "Something went wrong",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => setDialogOpen(true)}
            >
              Try again
            </ToastAction>
          ),
          variant: "destructive",
        });

        queryClient.setQueryData([linkQueryKey], context.previousLinks);
        queryClient.setQueryData(currentTagQueryKey, context.previousTags);
      }
    },

    async onSettled(_data, error) {
      // queryClient.invalidateQueries({ queryKey: [linkQueryKey] });

      // Only invalidating when there is no error.
      if (!error) {
        await queryClient.invalidateQueries({ queryKey: currentTagQueryKey });
        window.postMessage({ action: "shortcutsChanged" }, "*");
      }
      setTagMutationLoading(false);
    },
  });

  const sessionCreateMutation = useMutation({
    mutationFn: async (newSession: SessionForm) =>
      await fetcher("/api/session", "POST", newSession),

    onSuccess: async () => {
      setSessionDialogOpen(false);
      setAddDropdownOpen(false);
      setSelectedSessionLinkIds([]);
      sessionForm.reset();
      setTabValue("sessions");
      await queryClient.invalidateQueries({ queryKey: [sessionQueryKey] });
    },

    onError(error) {
      toast({
        title: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const sessionDeleteMutation = useMutation({
    mutationFn: async (sessionId: string) =>
      await fetcher("/api/session", "DELETE", { sessionId }),

    async onMutate(sessionId) {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [sessionQueryKey] });

      // Getting the previous sessions
      const previousSessions = queryClient.getQueryData([sessionQueryKey]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [sessionQueryKey],
        (oldSessions: AllSessionsAPIResponse | undefined) => {
          if (oldSessions) {
            const updatedSessions = oldSessions.sessions.filter(
              (session) => session.id !== sessionId,
            );

            return { sessions: updatedSessions };
          }
        },
      );

      // Return the context with previous value
      return { previousSessions };
    },

    onError(_error, _newLink, context) {
      if (context) {
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });

        queryClient.setQueryData([sessionQueryKey], context.previousSessions);
      }
    },

    async onSettled(_data, error) {
      // Only invalidating when there is no error.
      if (!error) {
        await queryClient.invalidateQueries({ queryKey: [sessionQueryKey] });
      }
    },
  });

  const sessionLinkDeleteMutation = useMutation({
    mutationFn: async ({
      sessionId,
      sessionLinkId,
    }: {
      sessionId: string;
      sessionLinkId: string;
    }) =>
      await fetcher("/api/session/link", "DELETE", {
        sessionId,
        sessionLinkId,
      }),

    async onMutate({ sessionId, sessionLinkId }) {
      await queryClient.cancelQueries({ queryKey: [sessionQueryKey] });
      const previousSessions = queryClient.getQueryData([sessionQueryKey]);

      queryClient.setQueryData(
        [sessionQueryKey],
        (oldSessions: AllSessionsAPIResponse | undefined) => {
          if (!oldSessions) {
            return oldSessions;
          }

          return {
            sessions: oldSessions.sessions.map((currentSession) =>
              currentSession.id === sessionId
                ? {
                    ...currentSession,
                    sessionLinks: currentSession.sessionLinks.filter(
                      (sessionLink) => sessionLink.id !== sessionLinkId,
                    ),
                  }
                : currentSession,
            ),
          };
        },
      );

      return { previousSessions };
    },

    onError(error, _variables, context) {
      toast({
        title: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });

      if (context) {
        queryClient.setQueryData([sessionQueryKey], context.previousSessions);
      }
    },

    async onSettled(_data, error) {
      if (!error) {
        await queryClient.invalidateQueries({ queryKey: [sessionQueryKey] });
      }
    },
  });

  // Effect for changing the tab value
  useEffect(() => {
    if (tabValue === "links") {
      setGlobalSearch({ type: tabValue, searchText: "" });
      setLinkData(linkQuery.data as AllLinksAPIResponse | undefined);
    } else {
      setGlobalSearch({ type: tabValue, searchText: "" });
      setSessionData(sessionQuery.data as AllSessionsAPIResponse | undefined);
    }
  }, [
    linkQuery.data,
    tabValue,
    setGlobalSearch,
    setLinkData,
    sessionQuery.data,
    setSessionData,
  ]);

  useEffect(() => {
    if (tagsData?.tags) {
      const tagsForFilter = tagsData.tags.map((tag) => ({
        name: tag.tagName,
        filterApplied: false,
      }));

      setFilterChips(tagsForFilter);
    }
  }, [tagsData?.tags]);

  useEffect(() => {
    if (!dialogOpen) {
      setShortcut("");
    }
  }, [dialogOpen]);

  useEffect(() => {
    const selectedLinks =
      linkQuery.data?.links
        .filter((link) => selectedSessionLinkIds.includes(link.id))
        .map((link) => ({ name: link.name, url: link.url })) ?? [];

    sessionForm.setValue("sessionLinks", selectedLinks, {
      shouldValidate: sessionForm.formState.isSubmitted,
    });
  }, [linkQuery.data?.links, selectedSessionLinkIds, sessionForm]);

  useEffect(() => {
    if (!filterDropdownOpen) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      tagSearchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [filterDropdownOpen]);

  useEffect(() => {
    useAppStore.setState((state) => {
      // For checking whether the search is for link or not
      if (state.globalSearch.type === "links") {
        // For ressting the link list when search is cleared
        if (state.globalSearch.searchText === "") {
          return {
            linkData: linkQuery.data,
          };
        } else {
          // If links exist then only apply search
          if (linkQuery.data?.links.length) {
            const filteredLinks = (
              linkQuery.data.links as AllLinksAPIResponse["links"]
            ).filter(
              (link) =>
                link.name
                  .toLowerCase()
                  .includes(state.globalSearch.searchText.toLowerCase()) ||
                link.url
                  .toLowerCase()
                  .includes(state.globalSearch.searchText.toLowerCase()),
            );

            return { linkData: { links: filteredLinks } };
          } else {
            return { ...state };
          }
        }
      } else {
        // For ressting the session list when search is cleared
        if (state.globalSearch.searchText === "") {
          return {
            sessionData: sessionQuery.data,
          };
        } else {
          // If sessions exist then only apply search
          if (sessionQuery.data?.sessions.length) {
            const filteredSessions = (
              sessionQuery.data.sessions as AllSessionsAPIResponse["sessions"]
            ).filter((session) =>
              session.name
                .toLowerCase()
                .includes(state.globalSearch.searchText.toLowerCase()),
            );

            return { sessionData: { sessions: filteredSessions } };
          } else {
            return { ...state };
          }
        }
      }
    });
  }, [linkQuery.data, sessionQuery.data, globalSearch]);

  useEffect(() => {
    const shortcutEventListener = (e: KeyboardEvent) => {
      const eventTarget = e.target as HTMLElement | null;

      if (
        eventTarget?.tagName === "INPUT" ||
        eventTarget?.tagName === "TEXTAREA" ||
        eventTarget?.isContentEditable
      ) {
        return;
      }

      const shortcutLink = linkQuery.data?.links.find(
        (link: AllLinksAPIResponse["links"][number]) =>
          link.shortcut?.shortcutKey &&
          matchesShortcut(e, link.shortcut.shortcutKey)
      );

      if (!shortcutLink) {
        return;
      }

      e.preventDefault();
      window.open(shortcutLink.url, "_blank", "noopener,noreferrer");
    };

    window.addEventListener("keydown", shortcutEventListener);

    return () => window.removeEventListener("keydown", shortcutEventListener);
  }, [linkQuery.data?.links]);

  // This submit func will call only after the data of links have been fetched
  const onSubmit = useCallback(
    (linkFormData: LinkForm) => {
      const nameExist = linkData!.links.some(
        (link) => link.name.toLowerCase() === linkFormData.name.toLowerCase(),
      );
      const URLExist = linkData!.links.some(
        (link) => link.url === linkFormData.url,
      );

      if (nameExist || URLExist) {
        return toast({
          title: `${nameExist ? "Link name" : "Link URL"} already exist`,
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => {
                if (nameExist && URLExist) {
                  linkForm.reset({ name: "", url: "" });
                } else if (URLExist) {
                  linkForm.resetField("url");
                } else if (nameExist) {
                  linkForm.resetField("name");
                }
              }}
            >
              Try again
            </ToastAction>
          ),
          variant: "destructive",
        });
      }

      const tags = tagParser(inputTags);

      const link = { ...linkFormData, tags, shortcut };

      // Checking duplication link name and url is remaining on server but client side validation done.
      mutation.mutate(link);
    },
    [mutation, linkData, linkForm, toast, inputTags, shortcut],
  );

  const onSessionSubmit = useCallback(
    (sessionFormData: SessionForm) => {
      const selectedLinks = linkQuery.data?.links.filter((link) =>
        selectedSessionLinkIds.includes(link.id),
      );

      if (!selectedLinks?.length) {
        sessionForm.setError("sessionLinks", {
          message: "Select at least one link",
        });
        return;
      }

      sessionCreateMutation.mutate({
        name: sessionFormData.name,
        sessionLinks: selectedLinks.map((link) => ({
          name: link.name,
          url: link.url,
        })),
      });
    },
    [
      linkQuery.data?.links,
      selectedSessionLinkIds,
      sessionCreateMutation,
      sessionForm,
    ],
  );

  const openAllSessionLinks = useCallback((links: Array<string>) => {
    window.postMessage(
      { action: "openLinks", linksToOpen: links },
      "*",
    );
  }, []);

  const lottieLoader = (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <DotLottieReact
        className="h-[30rem] w-[30rem]"
        src="/animations/hand-loader.lottie"
        loop
        autoplay
      />
    </div>
  );

  if (tabValue === "links") {
    listData.current = linkQuery.isLoading ? (
      lottieLoader
    ) : linkData?.links?.length ? (
      linkData?.links.map((link) => (
        <Link
          key={link.id}
          name={link.name}
          tags={link.tags}
          url={link.url}
          shortcut={link.shortcut?.shortcutKey ?? ""}
          filteredTags={filteredTags}
        />
      ))
    ) : (
      <div className="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center min-h-[200px] p-6">
        <div>
          <Sparkles className="w-10 h-10 text-muted-foreground mb-4" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Links Found</h3>
        <p className="text-sm text-muted-foreground">
          Create a link to get started.
        </p>
      </div>
    );
  } else {
    listData.current = sessionQuery.isLoading ? (
      lottieLoader
    ) : sessionData?.sessions?.length ? (
      sessionData?.sessions.map((session) => (
        <Session
          key={session.id}
          id={session.id}
          name={session.name}
          sessionLinks={session.sessionLinks}
          createdAt={session.createdAt}
          onDeleteSession={(sessionId) =>
            sessionDeleteMutation.mutate(sessionId)
          }
          onSessionLinkDelete={(sessionId, sessionLinkId) =>
            sessionLinkDeleteMutation.mutate({ sessionId, sessionLinkId })
          }
          onOpenAllLinks={openAllSessionLinks}
        />
      ))
    ) : (
      <div className="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center min-h-[200px] p-6">
        <div>
          <Sparkles className="w-10 h-10 text-muted-foreground mb-4" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Sessions Found</h3>
        <p className="text-sm text-muted-foreground">
          Create a session to open a group of links together.
        </p>
      </div>
    );
  }

  const normalizedTagSearch = tagSearch.trim().toLowerCase();
  const activeFilterTags = new Set(filteredTags);
  const visibleFilterChips = filterChips
    .filter((tag) => tag.name.toLowerCase().includes(normalizedTagSearch))
    .map((tag) => ({
      ...tag,
      filterApplied: activeFilterTags.has(tag.name),
    }))
    .sort(
      (firstTag, secondTag) =>
        Number(secondTag.filterApplied) - Number(firstTag.filterApplied),
    );

  return (
    <div>
      <div
        className="flex justify-between items-center p-4 sticky left-0 bg-background"
        style={{ top: `${headerHeight}px` }}
      >
        <DropdownMenu
          open={filterDropdownOpen}
          onOpenChange={(open) => {
            setFilterDropdownOpen(open);

            if (!open) {
              setTagSearch("");
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className={cn(
                filteredTags.length
                  ? "text-background relative bg-primary hover:bg-primary/80"
                  : "bg-white text-text border-accent-foreground hover:bg-white/50",
              )}
            >
              {filteredTags.length > 0 && (
                <sup className="rounded-full left-[9%] top-[4%] absolute min-w-[1rem] text-[0.55rem] text-xs bg-red-600">
                  {filteredTags.length}
                </sup>
              )}
              <Filter /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-slate-100 space-y-4 lg:w-96 md:w-80 sm:w-60 w-40"
            align="start"
          >
            <div className="p-4 pb-0">
              <Input
                ref={tagSearchInputRef}
                type="search"
                placeholder="Search tags"
                className="bg-white w-full"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-64 p-4 overflow-y-scroll [scrollbar-width:none] flex flex-wrap gap-4">
              {visibleFilterChips.map((tag) => {
                return (
                  <Button
                    key={tag.name}
                    className={cn(
                      "transition duration-250",
                      tag.filterApplied
                        ? "bg-primary flex items-center gap-3 hover:bg-primary/80 text-background"
                        : "bg-white hover:bg-slate-100 text-text",
                    )}
                    onClick={() => {
                      setFilteredTags((currentTags) =>
                        currentTags.includes(tag.name)
                          ? currentTags.filter(
                              (filteredTag) => filteredTag !== tag.name,
                            )
                          : [...currentTags, tag.name],
                      );
                    }}
                  >
                    {tag.name}
                    {tag.filterApplied && <X />}
                  </Button>
                );
              })}
              {visibleFilterChips.length === 0 && (
                <p className="w-full py-4 text-center text-sm text-muted-foreground">
                  No tags found.
                </p>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-4">
          <Tabs
            value={tabValue}
            onValueChange={(value) => setTabValue(value as TabValueType)}
          >
            <TabsList className="bg-white rounded-md">
              <TabsTrigger className="rounded-sm" value="links">
                Link
              </TabsTrigger>
              <TabsTrigger className="rounded-sm" value="sessions">
                Session
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu
            open={addDropdownOpen}
            onOpenChange={setAddDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="bg-white hover:bg-slate-100"
                disabled={linkQuery.isLoading}
                size={"icon"}
              >
                <Plus className="text-text" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Dropdown item for opening add link dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      setDialogOpen(true);
                    }}
                  >
                    Add link
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Link</DialogTitle>
                    <DialogDescription>
                      Enter the details of the link you want to save.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...linkForm}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-3"
                    >
                      <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Link name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="url"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="URL" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-1">
                        <Label>Tags {"(optional)"}</Label>
                        <TagInput
                          tags={inputTags}
                          setInputTags={setInputTags}
                          availableTags={tagsData?.tags.map((tag) => ({
                            id: tag.id,
                            text: tag.tagName,
                          }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Shortcut</Label>
                      <ShortcutPicker
                        value={shortcut}
                        onChange={setShortcut}
                        disabled={
                          !shortcut &&
                          (linkQuery.data?.links.filter(
                            (link) => link.shortcut?.shortcutKey,
                          ).length ?? 0) >= maxLinkShortcuts
                        }
                      />
                      </div>

                      <Button type="submit">Save Link</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setAddDropdownOpen(false);
                  setSessionDialogOpen(true);
                }}
              >
                Add session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog
        open={sessionDialogOpen}
        onOpenChange={(open) => {
          setSessionDialogOpen(open);

          if (!open) {
            setSelectedSessionLinkIds([]);
            sessionForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Session</DialogTitle>
            <DialogDescription>
              Name the session and choose the links you want to open together.
            </DialogDescription>
          </DialogHeader>

          <Form {...sessionForm}>
            <form
              onSubmit={sessionForm.handleSubmit(onSessionSubmit)}
              className="space-y-3"
            >
              <FormField
                control={sessionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Session name" autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1">
                <Label>Links</Label>
                <ScrollArea className="h-64 w-full rounded-md border p-2">
                  {linkQuery.data?.links.length ? (
                    linkQuery.data.links.map((link) => {
                      const checkboxId = `session-link-${link.id}`;
                      const isSelected = selectedSessionLinkIds.includes(
                        link.id,
                      );

                      return (
                        <label
                          key={link.id}
                          htmlFor={checkboxId}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-accent",
                            isSelected && "bg-accent",
                          )}
                        >
                          <Checkbox
                            id={checkboxId}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              setSelectedSessionLinkIds((currentIds) =>
                                checked === true
                                  ? Array.from(
                                      new Set([...currentIds, link.id]),
                                    )
                                  : currentIds.filter(
                                      (currentId) => currentId !== link.id,
                                    ),
                              );
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block font-medium">
                              {link.name}
                            </span>
                            <span className="block truncate text-sm text-muted-foreground">
                              {link.url}
                            </span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Add a link before creating a session.
                    </p>
                  )}
                </ScrollArea>
                {sessionForm.formState.errors.sessionLinks?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {sessionForm.formState.errors.sessionLinks.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    sessionCreateMutation.isLoading ||
                    !linkQuery.data?.links.length
                  }
                >
                  Save Session
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 p-5">
        {listData.current}
      </div>
    </div>
  );
};

export default LinksClient;
