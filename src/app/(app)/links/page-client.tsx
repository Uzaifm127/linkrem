"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "@/components/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { LinkData, LinkForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema } from "@/lib/zod-schemas";
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
  linkQueryKey,
  sessionQueryKey,
  tagQueryKey,
} from "@/constants/query-keys";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { TagInput } from "@/components/ui/tag-input";
import { Tag } from "emblor";
import { tagParser } from "@/lib/functions";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import {
  linkDeletePopupCookieKey,
  sessionDeletePopupCookieKey,
} from "@/constants/cookie-keys";
import { Session } from "@/components/session";

type TabValueType = "links" | "sessions";

const LinksClient = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [tabValue, setTabValue] = useState<TabValueType>("links");
  const [linkDeleteDialogOpen, setLinkDeleteDialogOpen] = useState(false);
  const [sessionDeleteDialogOpen, setSessionDeleteDialogOpen] = useState(false);
  const [linkDeletePopupCheck, setLinkDeletePopupCheck] = useState(false);
  const [sessionDeletePopupCheck, setSessionDeletePopupCheck] = useState(false);
  const [inputTags, setInputTags] = useState<Tag[]>([]);

  const { data: session } = useSession();

  const {
    linkData,
    setLinkData,
    setSessionData,
    sessionData,
    setTagMutationLoading,
    headerHeight,
  } = useAppStore();

  const { toast } = useToast();

  const listData = useRef<ReactNode | null>(null);

  const queryClient = useQueryClient();

  // Querying for links
  const linkQuery = useQuery({
    queryKey: [linkQueryKey],
    queryFn: async () => await fetcher("/api/link/my-links"),
    enabled: tabValue === "links",
    retry: false,
  });

  // Querying for sessions
  const sessionQuery = useQuery({
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

  const mutation = useMutation({
    mutationFn: async (linkDataObject: LinkData) =>
      await fetcher("/api/link", "POST", linkDataObject),

    async onMutate(newLink) {
      // Doing mutation for links but also disabling the tags
      setTagMutationLoading(true);

      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [linkQueryKey] }),
        queryClient.cancelQueries({ queryKey: [tagQueryKey] }),
      ]);

      // Getting the previous links
      const previousLinks = queryClient.getQueryData([linkQueryKey]);

      // Getting the previous tags associated with that link
      const previousTags = queryClient.getQueryData([tagQueryKey]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [linkQueryKey],
        (oldLinks: AllLinksAPIResponse | undefined) => {
          if (oldLinks) {
            const tags = newLink.tags.map((tag) => ({
              id: uuid(),
              tagName: tag,
              locked: false,
              userId: session?.user.id || uuid(),
              createdAt: new Date(new Date().toISOString()),
              updatedAt: new Date(new Date().toISOString()),
            }));

            return {
              links: [
                ...oldLinks.links,
                {
                  id: uuid(),
                  name: newLink.name,
                  url: newLink.url,
                  tags: tags || [],
                  userId: session?.user.id || uuid(),
                  sessionLinksId: null,
                  createdAt: new Date(new Date().toISOString()),
                  updatedAt: new Date(new Date().toISOString()),
                },
              ],
            };
          }
        }
      );

      setDialogOpen(false);
      linkForm.reset();
      // Closing dropdown after closing dialog
      setAddDropdownOpen(false);

      // Return the context with previous value
      return { previousLinks, previousTags };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError(_error, _newLink, context) {
      if (context) {
        toast({
          title: "Something went wrong",
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
        queryClient.setQueryData([tagQueryKey], context.previousTags);
      }
    },

    async onSettled(_data, error) {
      // queryClient.invalidateQueries({ queryKey: [linkQueryKey] });

      // Only invalidating when there is no error.
      if (!error) {
        await queryClient.invalidateQueries({ queryKey: [tagQueryKey] });
      }
      setTagMutationLoading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (currentLinkName: string) =>
      await fetcher("/api/link", "DELETE", { currentLinkName } as {
        currentLinkName: string;
      }),

    async onMutate(currentLinkName) {
      // Doing mutation for links but also disabling the tags
      setTagMutationLoading(true);

      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [linkQueryKey] }),
        queryClient.cancelQueries({ queryKey: [tagQueryKey] }),
      ]);

      // Getting the previous links
      const previousLinks = queryClient.getQueryData([linkQueryKey]);

      // Getting the previous tags associated with that link
      const previousTags = queryClient.getQueryData([tagQueryKey]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [linkQueryKey],
        (oldLinks: AllLinksAPIResponse | undefined) => {
          if (oldLinks) {
            const updatedLinks = oldLinks.links.filter(
              (link) => link.name !== currentLinkName
            );

            return { links: updatedLinks };
          }
        }
      );

      setLinkDeleteDialogOpen(false);

      // Setting up the user preference, If any
      if (linkDeletePopupCheck) {
        // Expires after session over
        Cookies.set(linkDeletePopupCookieKey, "yes");
      }

      // Return the context with previous value
      return { previousLinks, previousTags };
    },

    onError(_error, _newLink, context) {
      if (context) {
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });

        queryClient.setQueryData([linkQueryKey], context.previousLinks);
        queryClient.setQueryData([tagQueryKey], context.previousTags);
      }
    },

    async onSettled(_data, error) {
      // queryClient.invalidateQueries({ queryKey: [linkQueryKey] });

      // Only invalidating when there is no error.
      if (!error) {
        await queryClient.invalidateQueries({ queryKey: [tagQueryKey] });
      }
      setTagMutationLoading(false);
    },
  });

  const sessionDeleteMutation = useMutation({
    mutationFn: async (currentSessionName: string) =>
      await fetcher("/api/session", "DELETE", { currentSessionName } as {
        currentSessionName: string;
      }),

    async onMutate(currentSessionName) {
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
              (session) => session.name !== currentSessionName
            );

            return { sessions: updatedSessions };
          }
        }
      );

      setSessionDeleteDialogOpen(false);

      // Setting up the user preference, If any
      if (sessionDeletePopupCheck) {
        // Expires after session over
        Cookies.set(sessionDeletePopupCookieKey, "yes");
      }

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

  useEffect(() => {
    if (tabValue === "links") {
      setLinkData(linkQuery.data as AllLinksAPIResponse | undefined);
    } else {
      setSessionData(sessionQuery.data as AllSessionsAPIResponse | undefined);
    }
  }, [
    linkQuery.data,
    tabValue,
    setLinkData,
    sessionQuery.data,
    setSessionData,
  ]);

  useEffect(() => {
    useAppStore.setState((state) => {
      // For checking whether the search is for link or not
      if (state.globalSearch.type === "link") {
        // For ressting the link list when search is cleared
        if (state.globalSearch.searchText === "") {
          return {
            linkData: linkQuery.data,
          };
        } else {
          // If links exist then only apply search
          if (state.linkData?.links.length) {
            const filteredLinks = state.linkData.links.filter(
              (link) =>
                link.name
                  .toLowerCase()
                  .includes(state.globalSearch.searchText.toLowerCase()) ||
                link.url
                  .toLowerCase()
                  .includes(state.globalSearch.searchText.toLowerCase())
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
          if (state.sessionData?.sessions.length) {
            const filteredSessions = state.sessionData.sessions.filter(
              (session) =>
                session.name
                  .toLowerCase()
                  .includes(state.globalSearch.searchText.toLowerCase())
            );

            return { sessionData: { sessions: filteredSessions } };
          } else {
            return { ...state };
          }
        }
      }
    });
  }, [linkQuery.data, sessionQuery.data]);

  // This submit func will call only after the data of links have been fetched
  const onSubmit = useCallback(
    (linkFormData: LinkForm) => {
      const nameExist = linkData!.links.some(
        (link) => link.name.toLowerCase() === linkFormData.name.toLowerCase()
      );
      const URLExist = linkData!.links.some(
        (link) => link.url === linkFormData.url
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

      const link = { ...linkFormData, tags };

      // Checking duplication link name and url is remaining on server but client side validation done.
      mutation.mutate(link);
    },
    [mutation, linkData, linkForm, toast, inputTags]
  );

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
          deletePopupCheck={linkDeletePopupCheck}
          setDeletePopupCheck={setLinkDeletePopupCheck}
          deleteDialogOpen={linkDeleteDialogOpen}
          setDeleteDialogOpen={setLinkDeleteDialogOpen}
          onLinkDelete={() => deleteMutation.mutate(link.name)}
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
          name={session.name}
          sessionLinks={session.sessionLinks}
          createdAt={session.createdAt}
          setSessionDeletePopupCheck={setSessionDeletePopupCheck}
          sessionDeletePopupCheck={sessionDeletePopupCheck}
          setSessionDeleteDialogOpen={setSessionDeleteDialogOpen}
          sessionDeleteDialogOpen={sessionDeleteDialogOpen}
          onDeleteSession={(sessionName) =>
            sessionDeleteMutation.mutate(sessionName)
          }
          onSessionLinkDelete={() => {}}
        />
      ))
    ) : (
      <div className="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center min-h-[200px] p-6">
        <div>
          <Sparkles className="w-10 h-10 text-muted-foreground mb-4" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Sessions Found</h3>
        <p className="text-sm text-muted-foreground">
          Create a session from extension.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex justify-between items-center p-4 sticky left-0 bg-background"
        style={{ top: `${headerHeight}px` }}
      >
        <Button
          type="button"
          className="bg-accent-foreground hover:bg-accent-foreground/70"
        >
          <Filter /> Filter
        </Button>

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
                        />
                      </div>

                      <Button type="submit">Save Link</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* For Saving sessions */}
              <DropdownMenuItem disabled>Add session</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-5 p-5">
        {listData.current}
      </div>
    </div>
  );
};

export default LinksClient;
