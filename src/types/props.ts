export interface LinkProps {
  id: string;
  name: string;
  tags: Array<{
    id: string;
    tagName: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  url: string;
}

export interface SVGProps {
  className?: string;
}
