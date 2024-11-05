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
  tags: z.string(),
});
