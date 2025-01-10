"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Copy, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
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
import { v4 as uuid } from "uuid";
import { sessionDeletePopupCookieKey } from "@/constants/cookie-keys";

export function Session({
  name,
  sessionLinks,
  createdAt,
  sessionDeletePopupCheck,
  setSessionDeletePopupCheck,
  sessionDeleteDialogOpen,
  setSessionDeleteDialogOpen,
  onDeleteSession,
  onSessionLinkDelete,
}: SessionProps) {
  // Extracting user preferences from cookies
  const dontShowSessionDeletePopup = Cookies.get(sessionDeletePopupCookieKey);

  const [isExpanded, setIsExpanded] = useState(false);

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
                  onClick={() => setIsExpanded(!isExpanded)}
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
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}{" "}
        </CardDescription>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {sessionLinks.map((sessionLink) => (
              <div
                key={sessionLink.id}
                className="flex justify-between items-center mb-2 p-2 hover:bg-accent rounded-md"
              >
                <div>
                  <a
                    href={sessionLink.url}
                    target={`_linkrem-${uuid()}`}
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {sessionLink.name}
                  </a>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialog
                          open={sessionDeleteDialogOpen}
                          onOpenChange={setSessionDeleteDialogOpen}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your session and
                                remove your session data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="dont-show-again"
                                checked={sessionDeletePopupCheck}
                                onCheckedChange={(checked) => {
                                  if (typeof checked === "boolean") {
                                    setSessionDeletePopupCheck(checked);
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
                                onClick={() => onSessionLinkDelete(name)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (!!dontShowSessionDeletePopup) {
                              onSessionLinkDelete(name);
                            } else {
                              setSessionDeleteDialogOpen(true);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      )}
      <CardFooter className="flex justify-between">
        <div>
          <Button variant="destructive" onClick={() => onDeleteSession(name)}>
            Delete Session
          </Button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" onClick={() => {}}>
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
    </Card>
  );
}
