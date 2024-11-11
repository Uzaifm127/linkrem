import { cn } from "@/lib/utils";
import { SVGProps } from "@/types/props";
import React from "react";

const AppIcon: React.FC<SVGProps> = ({ className }) => {
  return (
    <svg
      className={cn(className)}
      width="380"
      height="380"
      viewBox="0 0 380 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="74"
        y="74"
        width="58"
        height="58"
        stroke="#2B2B2B"
        strokeWidth="20"
      />
      <rect
        x="190"
        y="74"
        width="58"
        height="58"
        stroke="#2B2B2B"
        strokeWidth="20"
      />
      <rect
        x="190"
        y="190"
        width="58"
        height="58"
        stroke="#2B2B2B"
        strokeWidth="20"
      />
      <rect
        x="74"
        y="190"
        width="58"
        height="58"
        stroke="#2B2B2B"
        strokeWidth="20"
      />
      <rect
        x="132"
        y="132"
        width="58"
        height="58"
        stroke="#3493FF"
        strokeWidth="20"
      />
      <rect
        x="248"
        y="132"
        width="58"
        height="58"
        stroke="#3493FF"
        strokeWidth="20"
      />
      <rect
        x="248"
        y="248"
        width="58"
        height="58"
        stroke="#3493FF"
        strokeWidth="20"
      />
      <rect
        x="132"
        y="248"
        width="58"
        height="58"
        stroke="#3493FF"
        strokeWidth="20"
      />
    </svg>
  );
};

export default AppIcon;
