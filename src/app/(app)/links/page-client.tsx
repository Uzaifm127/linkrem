"use client";

import React, { useCallback, useState } from "react";
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
import { AllLinksAPIResponse } from "@/types/server/response";
import { useToast } from "@/hooks/use-toast";
import { tagsParser } from "@/lib/functions";
import { ToastAction } from "@/components/ui/toast";
import { v4 as uuid } from "uuid";

const LinksClient = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  const queryClient = useQueryClient();

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

  const linkQuery = useQuery({
    queryKey: ["links"],
    queryFn: async () => await fetcher("/api/link/all"),
  });

  const { data }: { data: AllLinksAPIResponse | undefined } = linkQuery;

  const mutation = useMutation({
    mutationFn: async (linkData: LinkForm) =>
      await fetcher("/api/link", "POST", linkData),

    async onMutate(newLink) {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["links"] });

      // Getting the previous links
      const previousLinks = queryClient.getQueryData(["links"]);

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
                  ...newLink,
                  id: uuid(),
                  tags: tags || [],
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

      // Return the context with previous value
      return { previousLinks };
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
      }
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const onSubmit = useCallback(
    (linkData: LinkForm) => {
      mutation.mutate(linkData);
    },
    [mutation]
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
            <Button type="button" className="bg-accent hover:bg-accent/90">
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
        {data?.links.map((link) => (
          <Link
            key={link.id}
            id={link.id}
            name={link.name}
            tags={link.tags}
            url={link.url}
          />
        ))}

        {/* <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        />
        <Link
          name="slfkjsd"
          tags={["lsdjf", "laksdfj"]}
          url="alsdkfjs;lfjfsdlfj"
        /> */}
      </div>
    </div>
  );
};

export default LinksClient;
