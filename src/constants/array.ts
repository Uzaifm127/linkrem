import { Bookmark, Command, Link, Tag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export const sidebarPlatformItems = [
  {
    id: uuidv4(),
    title: "Links",
    url: "/links",
    icon: Link,
  },
  {
    id: uuidv4(),
    title: "Tags",
    icon: Tag,
    items: [],
  },
  {
    id: uuidv4(),
    title: "Shortcuts",
    icon: Command,
    url: "/shortcuts",
  },
  {
    id: uuidv4(),
    title: "Sessions",
    icon: Bookmark,
    url: "/sessions",
  },
];
