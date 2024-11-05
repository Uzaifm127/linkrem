export interface CreateLinkRequest {
  name: string;
  url: string;
  tags: string;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
