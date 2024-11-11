export interface CreateLinkRequest {
  name: string;
  url: string;
  tags: string;
}

export interface UpdateLinkRequest extends CreateLinkRequest {
  id: string;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
