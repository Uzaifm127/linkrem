import { linkSchema, loginSchema, sessionSchema } from "@/lib/zod-schemas";
import { z } from "zod";

export type LoginForm = z.infer<typeof loginSchema>;

export type LinkForm = z.infer<typeof linkSchema>;

export type SessionForm = z.infer<typeof sessionSchema>;

export interface TagInputValue {
  id: string;
  text: string;
}

export interface LinkData extends LinkForm {
  tags: Array<string>;
  shortcut: string;
}

export interface LinkDataForUpdate extends LinkData {
  nameChange: boolean;
  URLChange: boolean;
  tagChange: boolean;
}
