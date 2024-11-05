import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkProps } from "@/types/props";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const Link: React.FC<LinkProps> = ({ name, url, tags }) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{url}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Prevent creation of same tag */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-secondary/40 hover:bg-secondary/30 text-text px-2 text-sm"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="default" className="w-full" asChild>
          <a href={url} target="_linkrem">
            <ExternalLink className="h-4 w-4" />
            Open Link
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Link;
