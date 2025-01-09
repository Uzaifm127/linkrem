import { Prisma } from "@prisma/client";

export interface AllLinksAPIResponse {
  links: Array<
    Prisma.LinkGetPayload<{
      include: {
        tags: true;
        // linkSessions: true;
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

export interface AllSessionsAPIResponse {
  sessions: Array<
    Prisma.SessionLinksGetPayload<{
      include: {
        links: {
          include: {
            tags: true;
          };
        };
      };
    }>
  >;
}
