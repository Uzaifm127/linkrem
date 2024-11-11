import React, { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkProps } from "@/types/props";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastAction } from "./ui/toast";
import { fetcher } from "@/lib/fetcher";
import { LinkForm } from "@/types";
import { AllLinksAPIResponse } from "@/types/server/response";
import { tagsParser } from "@/lib/functions";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema } from "@/lib/zod-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Link: React.FC<LinkProps> = ({ name, url, tags, id }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const updateLinkForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    mode: "onSubmit",
    defaultValues: {
      name,
      url,
      tags: tags.map((tag) => tag.tagName).join(", "),
    },
  });

  const { control, handleSubmit } = updateLinkForm;

  const updateMutation = useMutation({
    mutationFn: async (linkUpdatedData: LinkForm) =>
      await fetcher("/api/link", "PUT", { id, ...linkUpdatedData }),

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
            const tags = tagsParser(newLink.tags)?.map((tag, index) => ({
              ...tag,
              id: index + 1,
              createdAt: new Date(new Date().toISOString()),
              updatedAt: new Date(new Date().toISOString()),
            }));

            // For temporary id of optimistic update
            const maxId = Math.max(...oldLinks.links.map((link) => link.id));

            return {
              links: [
                ...oldLinks.links,
                {
                  ...newLink,
                  id: maxId + 1,
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
      updateLinkForm.reset();

      // Return the context with previous value
      return { previousLinks };
    },

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
    (updatedLinkData: LinkForm) => {
      updateMutation.mutate(updatedLinkData);
    },
    [updateMutation]
  );
  return (
    <Card className="bg-white flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex justify-between">
            {name}{" "}
            <div className="flex gap-1 items-center">
              <Edit
                className="h-7 w-7 rounded-sm transition cursor-pointer text-text-foreground hover:bg-slate-100 p-1"
                onClick={() => setDialogOpen(true)}
              />
              <Trash2
                className="h-7 w-7 rounded-sm transition text-red-600 cursor-pointer hover:bg-red-300 p-1"
                onClick={() => {}}
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Link</DialogTitle>
                  <DialogDescription>
                    Enter the details of the link you want to save.
                  </DialogDescription>
                </DialogHeader>

                <Form {...updateLinkForm}>
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
          </CardTitle>
          <CardDescription>{url}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                className="bg-secondary/40 hover:bg-secondary/30 text-text px-2 text-sm font-medium"
              >
                {tag.tagName}
              </Badge>
            ))}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        <Button variant="default" className="w-full" asChild>
          <a href={url} target="_linkrem">
            <ExternalLink className="h-4 w-4" />
            Open Link
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Link;
