"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Copy, Trash } from "lucide-react";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SessionProps } from "@/types/props";
import { sessionDeletePopupCookieKey } from "@/constants/cookie-keys";

export function Session({
  id,
  name,
  sessionLinks,
  createdAt,
  onDeleteSession,
  onSessionLinkDelete,
  onOpenAllLinks,
}: SessionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteSessionOpen, setDeleteSessionOpen] = useState(false);
  const [sessionLinkToDelete, setSessionLinkToDelete] = useState<string | null>(
    null,
  );
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const deleteSession = () => {
    if (dontShowAgain) {
      Cookies.set(sessionDeletePopupCookieKey, "yes");
    }

    onDeleteSession(id);
    setDeleteSessionOpen(false);
  };

  return (
    <Card className="w-full max-w-2xl mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsExpanded((expanded) => !expanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Collapse" : "Expand"} session</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {sessionLinks.length ? (
              sessionLinks.map((sessionLink) => (
                <div
                  key={sessionLink.id}
                  className="flex justify-between items-center mb-2 p-2 hover:bg-accent rounded-md"
                >
                  <a
                    href={sessionLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline break-all"
                  >
                    {sessionLink.name}
                  </a>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setSessionLinkToDelete(sessionLink.id)
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                This session has no links.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      )}

      <CardFooter className="flex justify-between gap-3">
        <Button
          variant="destructive"
          onClick={() => {
            if (Cookies.get(sessionDeletePopupCookieKey)) {
              onDeleteSession(id);
            } else {
              setDeleteSessionOpen(true);
            }
          }}
        >
          Delete Session
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                disabled={!sessionLinks.length}
                onClick={() =>
                  onOpenAllLinks(
                    sessionLinks.map((sessionLink) => sessionLink.url),
                  )
                }
              >
                <Copy className="h-4 w-4 mr-2" />
                Open all links
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open all links</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>

      <AlertDialog open={deleteSessionOpen} onOpenChange={setDeleteSessionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this session. Your saved links will
              not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`dont-show-session-delete-${id}`}
              checked={dontShowAgain}
              onCheckedChange={(checked) =>
                setDontShowAgain(checked === true)
              }
            />
            <label
              htmlFor={`dont-show-session-delete-${id}`}
              className="text-sm font-medium cursor-pointer leading-none"
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
              onClick={deleteSession}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(sessionLinkToDelete)}
        onOpenChange={(open) => !open && setSessionLinkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This only removes the link from this session. It does not delete
              the saved link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-accent-foreground/20 hover:text-text">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive/20 text-destructive border border-destructive hover:bg-destructive/40"
              onClick={() => {
                if (sessionLinkToDelete) {
                  onSessionLinkDelete(id, sessionLinkToDelete);
                  setSessionLinkToDelete(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
