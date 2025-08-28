import { LinkDataForUpdate } from "@/types/index";

export interface CreateLinkRequest {
  name: string;
  url: string;
  tags: Array<string>;
  shortcut: string;
}

export interface UpdateLinkRequest extends LinkDataForUpdate {
  currentLinkName: string;
}

export interface CreateSessionLinkRequest {
  name: string;
  sessionLinks: Array<{ name: string; url: string }>;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
