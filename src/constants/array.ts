import { Bookmark, Command, Link, Tag } from "lucide-react";
import { v4 as uuid } from "uuid";

export const sidebarPlatformItems = [
  {
    id: uuid(),
    title: "Links",
    url: "/links",
    icon: Link,
  },
  {
    id: uuid(),
    title: "Tags",
    icon: Tag,
    items: [],
  },
  {
    id: uuid(),
    title: "Shortcuts",
    icon: Command,
    url: "/shortcuts",
  },
  {
    id: uuid(),
    title: "Sessions",
    icon: Bookmark,
    url: "/sessions",
  },
];
