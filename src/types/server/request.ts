export interface CreateLinkRequest {
  name: string;
  url: string;
  tags: string;
}

export interface UpdateLinkRequest extends CreateLinkRequest {
  currentLinkName: string;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
