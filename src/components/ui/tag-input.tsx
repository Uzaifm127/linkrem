import React, { useState } from "react";
import { TagInput as TagInputComponent } from "emblor";
import { TagProps } from "@/types/props";

export const TagInput: React.FC<TagProps> = ({ tags, setInputTags }) => {
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <TagInputComponent
      id="tags"
      tags={tags}
      setTags={(tags) => setInputTags(tags)}
      placeholder="Press Enter to add a tag"
      styleClasses={{
        input: "w-full",
        tag: {
          closeButton: "text-text hover:text-slate-600",
          body: "bg-gray-300 hover:bg-gray-300 border-none text-text",
        },
      }}
      activeTagIndex={activeTagIndex}
      setActiveTagIndex={setActiveTagIndex}
    />
  );
};
