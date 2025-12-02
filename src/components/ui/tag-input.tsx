import React, { useCallback, useMemo, useRef, useState } from "react";
import { TagInput as TagInputComponent } from "emblor";
import { TagProps } from "@/types/props";
import { useAppStore } from "@/store";
import { v6 as uuid } from "uuid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export const TagInput: React.FC<TagProps> = ({ tags, setInputTags }) => {
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const { tagsData, isTagsFetching } = useAppStore();

  const suggestions = useMemo(() => {
    if (tagsData && tagsData.tags) {
      return tagsData.tags.map((tag) => {
        return {
          id: `tag-${uuid()}`,
          text: tag.tagName,
        };
      });
    } else {
      return [];
    }
  }, [tagsData]);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return suggestions;

    return suggestions.filter((suggestion) =>
      suggestion.text.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [suggestions, inputValue]);

  const addTag = useCallback(
    (text: string) => {
      const processedValue = text.replace(/\$%/g, " ");

      const newTag = {
        id: `tag-${uuid()}`,
        text: processedValue,
      };
      setInputTags([...tags, newTag]);
      setInputValue("");
    },
    [tags, setInputTags],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === " ") {
        e.preventDefault();

        const value = inputValue.trim();

        if (value) {
          const processedValue = value.replace(/\$%/g, " ");

          const newTag = {
            id: `tag-${uuid()}`,
            text: processedValue,
          };

          setInputTags([...tags, newTag]);

          setInputValue("");
        }
      }

      // Prevent Enter key from adding tags (override default emblor behavior)
      if (e.key === "Enter") {
        e.preventDefault();
      }
    },
    [inputValue, tags, setInputValue, setInputTags],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  return (
    <TagInputComponent
      id="tags"
      tags={tags}
      setTags={(newTags) => setInputTags(newTags)}
      placeholder="Press space to add a tag"
      styleClasses={{
        input: "w-full shadow-none",
        inlineTagsContainer:
          "shadow-sm border-input overflow-hidden bg-white cursor-text",
        tag: {
          closeButton: "text-white hover:text-white/70",
          body: "border-none bg-accent/80 hover:bg-accent/70 rounded-sm text-xs text-white shadow-none h-7",
        },
        tagList: {
          container: "gap-2",
        },
      }}
      activeTagIndex={activeTagIndex}
      setActiveTagIndex={setActiveTagIndex}
      inputProps={{
        value: inputValue,
        onChange: handleInputChange,
        onKeyDown: handleKeyDown,
      }}
      disabled={isTagsFetching}
      animation="fadeIn"
    />
  );
};
