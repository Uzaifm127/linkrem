import type { Tag } from "emblor";

export const tagParser = (tags: Tag[]): Array<string> => {
  return tags.map((tag) => tag.text);
};

export const normalizeUrl = (url: string): string => {
  return url.endsWith("/") && url.length > 1 ? url.slice(0, -1) : url;
};

export const checkExtensionInstallation = () => {};
