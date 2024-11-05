import { linkSchema, loginSchema } from "@/lib/zod-schemas";
import { z } from "zod";

export type LoginForm = z.infer<typeof loginSchema>;

export type LinkForm = z.infer<typeof linkSchema>;
