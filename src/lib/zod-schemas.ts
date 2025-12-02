import { z } from "zod";

export const linkSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  url: z
    .string()
    .min(1, { message: "Required" })
    .url({ message: "Invalid URL" }),
});
