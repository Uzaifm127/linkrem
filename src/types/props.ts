import { Prisma } from "@prisma/client";
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
  links: Array<Prisma.LinkGetPayload<{ include: { tags: true } }>>;
  createdAt: Date;
  onDeleteSession: (id: string) => void;
  onSessionLinkDelete: (linkName: string) => void;
}
