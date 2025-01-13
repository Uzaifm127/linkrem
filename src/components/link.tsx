import React, { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LinkProps } from "@/types/props";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastAction } from "./ui/toast";
import { fetcher } from "@/lib/fetcher";
import { LinkDataForUpdate, LinkForm } from "@/types";
import { AllLinksAPIResponse } from "@/types/server/response";
import { tagParser } from "@/lib/functions";
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
import { v4 as uuid } from "uuid";
import { useAppStore } from "@/store";
import Cookies from "js-cookie";
import { linkDeletePopupCookieKey } from "@/constants/cookie-keys";
import { linkQueryKey, tagQueryKey } from "@/constants/query-keys";
import { Tag } from "emblor";
import { TagInput } from "@/components/ui/tag-input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

const Link: React.FC<LinkProps> = ({ name, url, tags }) => {
  // Extracting user preferences from cookies
  const dontShowDeletePopup = Cookies.get(linkDeletePopupCookieKey);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkDeleteDialogOpen, setLinkDeleteDialogOpen] = useState(false);
  const [linkDeletePopupCheck, setLinkDeletePopupCheck] = useState(false);
  const [inputTags, setInputTags] = useState<Tag[]>(() => {
    const tagsState = tags.map((tag) => ({ id: uuid(), text: tag.tagName }));

    return tagsState;
  });

  const { data: session } = useSession();

  const { setTagMutationLoading } = useAppStore();

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const updateLinkForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    mode: "onSubmit",
    defaultValues: {
      name,
      url,
    },
  });

  const { control, handleSubmit } = updateLinkForm;

  const updateMutation = useMutation({
    mutationFn: async (linkUpdatedData: LinkDataForUpdate) =>
      await fetcher("/api/link", "PUT", {
        currentLinkName: name,
        ...linkUpdatedData,
      }),

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
      const previousTags = queryClient.getQueryData([linkQueryKey]);

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

            const updatedLinks = oldLinks.links.map((link) => {
              if (link.name === name) {
                return {
                  id: uuid(),
                  name: newLink.name,
                  url: newLink.url,
                  tags: tags || [],
                  userId: session?.user.id || uuid(),
                  sessionLinksId: null,
                  createdAt: new Date(new Date().toISOString()),
                  updatedAt: new Date(new Date().toISOString()),
                };
              } else {
                return link;
              }
            });

            return { links: updatedLinks };
          }
        }
      );

      setEditDialogOpen(false);
      updateLinkForm.reset();

      // Return the context with previous value
      return { previousLinks, previousTags };
    },

    onError(_error, _newLink, context) {
      if (context) {
        toast({
          title: "Something went wrong",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => setEditDialogOpen(true)}
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

  // Link data must be there when we submit for update query
  const onSubmit = useCallback(
    (updatedLinkData: LinkForm) => {
      // Mutation happens when there is a change
      const nameChange = name !== updatedLinkData.name;
      const URLChange = url !== updatedLinkData.url;

      const currentTags = inputTags.map((tag) => tag.text.trim());

      const oldTags = tags.map((tag) => tag.tagName.trim());

      const tagChange = JSON.stringify(oldTags) !== JSON.stringify(currentTags);

      if (nameChange || URLChange || tagChange) {
        // Checking duplication link name and url is remaining on server and on the client side we have to check whether the data filled is already existed or not among all links.

        const tags = tagParser(inputTags);

        const updatedLink = {
          ...updatedLinkData,
          tags,
          nameChange,
          URLChange,
          tagChange,
        };

        updateMutation.mutate(updatedLink);
      } else {
        setEditDialogOpen(false);
      }
    },
    [updateMutation, name, tags, url, inputTags]
  );

  return (
    <Card className="bg-white flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex justify-between items-start text-ellipsis overflow-hidden">
            {name}{" "}
            <div className="flex gap-1 items-center">
              <Edit
                className="h-7 w-7 rounded-sm transition cursor-pointer text-text-foreground hover:bg-slate-100 p-1"
                onClick={() => setEditDialogOpen(true)}
              />
              <Trash2
                className="h-7 w-7 rounded-sm transition text-red-600 cursor-pointer hover:bg-red-200 p-1"
                onClick={() => {
                  if (!!dontShowDeletePopup) {
                    deleteMutation.mutate(name);
                  } else {
                    setLinkDeleteDialogOpen(true);
                  }
                }}
              />
            </div>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update the Link</DialogTitle>
                  <DialogDescription>
                    Enter the details of the link you want to update.
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

                    <div className="space-y-1">
                      <Label>Tags {"(optional)"}</Label>
                      <TagInput tags={inputTags} setInputTags={setInputTags} />
                    </div>

                    <Button type="submit">Save Link</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <AlertDialog
              open={linkDeleteDialogOpen}
              onOpenChange={setLinkDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your link and remove your link
                    data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dont-show-again"
                    checked={linkDeletePopupCheck}
                    onCheckedChange={(checked) => {
                      if (typeof checked === "boolean") {
                        setLinkDeletePopupCheck(checked);
                      }
                    }}
                  />
                  <label
                    htmlFor="dont-show-again"
                    className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Don&apos;t show again
                  </label>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:bg-accent-foreground/20 hover:text-text">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive/20 text-destructive border border-destructive hover:bg-destructive/40"
                    onClick={() => deleteMutation.mutate(name)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
          <CardDescription className="whitespace-nowrap text-ellipsis overflow-hidden">
            {url}
          </CardDescription>
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
