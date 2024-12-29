export interface CreateLinkRequest {
  name: string;
  url: string;
  tags: string;
}

export interface UpdateLinkRequest extends CreateLinkRequest {
  currentLinkName: string;
}

export interface CreateSessionLinkRequest {
  name: string;
  links: Array<{ name: string; url: string }>;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
