"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
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
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { LinkForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema } from "@/lib/zod-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { AllLinksAPIResponse } from "@/types/server/response";
import { useToast } from "@/hooks/use-toast";
import { tagsParser } from "@/lib/functions";
import { ToastAction } from "@/components/ui/toast";
import { v4 as uuid } from "uuid";
import { useAppStore } from "@/store";
import { motion } from "motion/react";
import {
  linkQueryKey,
  // sessionQueryKey,
  tagQueryKey,
} from "@/constants/query-keys";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// type TabValueType = "links" | "sessions";

const LinksClient = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  // const [tabValue, setTabValue] = useState<TabValueType>("links");

  const { linkData, setLinkData, setTagMutationLoading, headerHeight } =
    useAppStore();

  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Querying for links
  const linkQuery = useQuery({
    queryKey: [linkQueryKey],
    queryFn: async () => await fetcher("/api/link/all"),
    // enabled: tabValue === "links",
  });

  // Querying for sessions
  // const sessionQuery = useQuery({
  //   queryKey: [sessionQueryKey],
  //   queryFn: async () => await fetcher("/api/sessions"),
  //   enabled: tabValue === "sessions",
  // });

  const linkForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      url: "",
      tags: "",
    },
  });

  const { control, handleSubmit } = linkForm;

  const mutation = useMutation({
    mutationFn: async (linkData: LinkForm) =>
      await fetcher("/api/link", "POST", linkData),

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
            const tags = tagsParser(newLink.tags, false)?.map((tag) => ({
              ...tag,
              id: uuid(),
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

  useEffect(() => {
    setLinkData(linkQuery.data as AllLinksAPIResponse | undefined);
  }, [linkQuery.data, setLinkData]);

  // This submit func will call only after the data of links have been fetched
  const onSubmit = useCallback(
    (linkFormData: LinkForm) => {
      const nameExist = linkData!.links.some(
        (link) => link.name === linkFormData.name
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

      // Checking duplication link name and url is remaining on server but client side validation done.
      mutation.mutate(linkFormData);
    },
    [mutation, linkData, linkForm, toast]
  );

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
          {/* <Tabs
            value={tabValue}
            onValueChange={(value) => setTabValue(value as TabValueType)}
          >
            <TabsList className="bg-white rounded-md">
              <TabsTrigger className="rounded-sm" value="sessions">
                Session
              </TabsTrigger>
              <TabsTrigger className="rounded-sm" value="links">
                Link
              </TabsTrigger>
            </TabsList>
          </Tabs> */}

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
                          <FormItem>
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
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="URL" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags {"(optional)"}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Comma-separated tags, e.g. workspace, products, new"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
        {linkQuery.isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <DotLottieReact
              className="h-[30rem] w-[30rem]"
              src="/animations/hand-loader.lottie"
              loop
              autoplay
            />
          </motion.div>
        ) : (
          linkData?.links.map((link) => (
            <Link
              key={link.id}
              name={link.name}
              tags={link.tags}
              url={link.url}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LinksClient;
