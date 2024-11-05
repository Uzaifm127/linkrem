import { Link } from "@prisma/client";

export interface AllLinksAPIResponse {
  links: Array<Link>;
}
