import { linkSchema, loginSchema } from "@/lib/zod-schemas";
import { z } from "zod";

export type LoginForm = z.infer<typeof loginSchema>;

export type LinkForm = z.infer<typeof linkSchema>;

export interface LinkData extends LinkForm {
  tags: Array<string>;
}

export interface LinkDataForUpdate extends LinkData {
  nameChange: boolean;
  URLChange: boolean;
  tagChange: boolean;
}
