import { LinkDataForUpdate } from "@/types/index";

export interface CreateLinkRequest {
  name: string;
  url: string;
  tags: Array<string>;
}

export interface UpdateLinkRequest extends LinkDataForUpdate {
  currentLinkName: string;
}

export interface CreateSessionLinkRequest {
  name: string;
  links: Array<{ name: string; url: string }>;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
