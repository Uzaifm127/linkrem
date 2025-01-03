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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionProps } from "@/types/props";
import { v4 as uuid } from "uuid";

export function Session({
  name,
  links,
  createdAt,
  onDeleteSession,
  onSessionLinkDelete,
}: SessionProps) {
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
            {links.map((link) => (
              <div
                key={link.id}
                className="flex justify-between items-center mb-2 p-2 hover:bg-accent rounded-md"
              >
                <div>
                  <a
                    href={link.url}
                    target={`_linkrem-${uuid()}`}
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {link.name}
                  </a>
                  <div className="flex gap-1 mt-1">
                    {link.tags.map((tag) => (
                      <Badge
                        key={tag.tagName}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag.tagName}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSessionLinkDelete(link.name)}
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
