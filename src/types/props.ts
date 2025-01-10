import { SessionLinks } from "@prisma/client";
import { Tag } from "emblor";
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
  deletePopupCheck: boolean;
  setDeletePopupCheck: React.Dispatch<React.SetStateAction<boolean>>;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLinkDelete: () => void;
}

export interface SVGProps {
  className?: string;
}

export interface TagProps {
  tags: Array<Tag>;
  setInputTags: Dispatch<SetStateAction<Tag[]>>;
}

export interface SessionProps {
  name: string;
  sessionLinks: Array<SessionLinks>;
  createdAt: Date;
  sessionDeletePopupCheck: boolean;
  setSessionDeletePopupCheck: React.Dispatch<React.SetStateAction<boolean>>;
  sessionDeleteDialogOpen: boolean;
  setSessionDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteSession: (sessionName: string) => void;
  onSessionLinkDelete: (linkName: string) => void;
}
