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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { LinkForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema } from "@/lib/zod-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import {
  AllLinksAPIResponse,
  AllTagsAPIResponse,
} from "@/types/server/response";
import { useToast } from "@/hooks/use-toast";
import { tagsParser } from "@/lib/functions";
import { ToastAction } from "@/components/ui/toast";
import { v4 as uuid } from "uuid";
import { useAppStore } from "@/store";

const LinksClient = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { linkData, setLinkData } = useAppStore();

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const linkQuery = useQuery({
    queryKey: ["links"],
    queryFn: async () => await fetcher("/api/link/all"),
  });

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
      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["links"] }),
        queryClient.cancelQueries({ queryKey: ["tags"] }),
      ]);

      // Getting the previous links
      const previousLinks = queryClient.getQueryData(["links"]);

      // Getting the previous tags associated with that link
      const previousTags = queryClient.getQueryData(["tags"]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        ["links"],
        (oldLinks: AllLinksAPIResponse | undefined) => {
          if (oldLinks) {
            const tags = tagsParser(newLink.tags)?.map((tag) => ({
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

      queryClient.setQueryData(
        ["tags"],
        (oldTags: AllTagsAPIResponse | undefined) => {
          if (oldTags) {
            const link = {
              id: uuid(),
              name: newLink.name,
              url: newLink.url,
              sessionLinksId: null,
              createdAt: new Date(new Date().toISOString()),
              updatedAt: new Date(new Date().toISOString()),
            };

            const tags = tagsParser(newLink.tags);

            const newTags = tags
              ?.map((tag) => ({
                id: uuid(),
                tagName: tag.tagName,
                links: [link],
                createdAt: new Date(new Date().toISOString()),
                updatedAt: new Date(new Date().toISOString()),
              }))
              // Parsed tags and raw tags will be same so we can use one of them.
              .filter((tag) => !newLink.tags.includes(tag.tagName));

            return {
              tags: [...oldTags.tags, ...(newTags ? newTags : [])],
            };
          }
        }
      );

      setDialogOpen(false);
      linkForm.reset();

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

        queryClient.setQueryData(["links"], context.previousLinks);
        queryClient.setQueryData(["tags"], context.previousTags);
      }
    },

    // onSettled() {
    //   queryClient.invalidateQueries({ queryKey: ["links"] });
    //   queryClient.invalidateQueries({ queryKey: ["tags"] });
    // },
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
      <div className="flex justify-between items-center p-4 sticky top-0 left-0 bg-background">
        <Button
          type="button"
          className="bg-accent-foreground hover:bg-accent-foreground/70"
        >
          <Filter /> Filter
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="bg-accent hover:bg-accent/90"
              disabled={linkQuery.isLoading}
            >
              Add
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Link</DialogTitle>
              <DialogDescription>
                Enter the details of the link you want to save.
              </DialogDescription>
            </DialogHeader>

            <Form {...linkForm}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
      </div>

      <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-5 p-5">
        {linkData?.links.map((link) => (
          <Link
            key={link.id}
            name={link.name}
            tags={link.tags}
            url={link.url}
          />
        ))}
      </div>
    </div>
  );
};

export default LinksClient;
