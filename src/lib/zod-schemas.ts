import { z } from "zod";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const linkSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  url: z
    .string()
    .min(1, { message: "Required" })
    .url({ message: "Invalid URL" }),
});

export const sessionSchema = z.object({
  name: z.string().trim().min(1, { message: "Required" }),
  sessionLinks: z
    .array(
      z.object({
        name: z.string().trim().min(1, { message: "Link name is required" }),
        url: z.string().trim().url({ message: "Invalid link URL" }),
      }),
    )
    .min(1, { message: "Select at least one link" }),
});
