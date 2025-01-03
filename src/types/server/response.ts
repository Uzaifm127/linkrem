import { Prisma } from "@prisma/client";

export interface AllLinksAPIResponse {
  links: Array<
    Prisma.LinkGetPayload<{
      include: {
        tags: true;
        // sessionLinks: true;
      };
    }>
  >;
}

export interface AllTagsAPIResponse {
  tags: Array<
    Prisma.TagGetPayload<{
      include: {
        links: true;
      };
    }>
  >;
}
