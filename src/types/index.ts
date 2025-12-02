import { linkSchema } from "@/lib/zod-schemas";
import { z } from "zod";

export type LinkForm = z.infer<typeof linkSchema>;

export interface LinkData extends LinkForm {
  tags: Array<string>;
  shortcut: string;
}

export interface LinkDataForUpdate extends LinkData {
  nameChange: boolean;
  URLChange: boolean;
  tagChange: boolean;
}
