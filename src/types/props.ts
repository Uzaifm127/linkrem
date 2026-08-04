import { SessionLinks } from "@prisma/client";
import { TagInputValue } from "@/types";
import { Dispatch, SetStateAction } from "react";

export interface LinkProps {
  name: string;
  tags: Array<{
    id: string;
    tagName: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  url: string;
  shortcut: string;
  filteredTags: Array<never> | Array<string>;
}

export interface SVGProps {
  className?: string;
}

export interface TagProps {
  tags: Array<TagInputValue>;
  setInputTags: Dispatch<SetStateAction<TagInputValue[]>>;
  availableTags?: Array<TagInputValue>;
}

export interface SessionProps {
  id: string;
  name: string;
  sessionLinks: Array<SessionLinks>;
  createdAt: Date;
  onDeleteSession: (sessionId: string) => void;
  onSessionLinkDelete: (sessionId: string, sessionLinkId: string) => void;
  onOpenAllLinks: (links: Array<string>) => void;
}
