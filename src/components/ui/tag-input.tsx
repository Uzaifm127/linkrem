import React, { useId, useMemo, useRef, useState } from "react";
import { Plus, Tag as TagIcon, X } from "lucide-react";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { TagProps } from "@/types/props";

export const TagInput: React.FC<TagProps> = ({
  tags,
  setInputTags,
  availableTags = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const suggestionsId = useId();
  const tagInputContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedTagNames = useMemo(
    () => new Set(tags.map((tag) => tag.text.trim().toLowerCase())),
    [tags]
  );
  const normalizedInput = inputValue.trim().toLowerCase();
  const matchingTags = availableTags.filter(
    (tag) =>
      !selectedTagNames.has(tag.text.trim().toLowerCase()) &&
      tag.text.toLowerCase().includes(normalizedInput)
  );
  const matchingExistingTag = availableTags.find(
    (tag) => tag.text.trim().toLowerCase() === normalizedInput
  );
  const canCreateTag =
    Boolean(normalizedInput) &&
    !matchingExistingTag &&
    !selectedTagNames.has(normalizedInput);
  const optionCount = matchingTags.length + (canCreateTag ? 1 : 0);

  const addTag = (tag: { id: string; text: string }) => {
    const tagName = tag.text.trim();

    if (!tagName || selectedTagNames.has(tagName.toLowerCase())) {
      return;
    }

    setInputTags((currentTags) => [
      ...currentTags,
      { id: tag.id || uuid(), text: tagName },
    ]);
    setInputValue("");
    setActiveSuggestionIndex(-1);
    setSuggestionsOpen(true);
  };

  const addInputValue = () => {
    if (!normalizedInput) {
      return;
    }

    addTag(matchingExistingTag ?? { id: uuid(), text: inputValue });
  };

  const removeTag = (tagId: string) => {
    setInputTags((currentTags) =>
      currentTags.filter((tag) => tag.id !== tagId)
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) =>
        optionCount ? (currentIndex + 1) % optionCount : -1
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) =>
        optionCount
          ? currentIndex <= 0
            ? optionCount - 1
            : currentIndex - 1
          : -1
      );
      return;
    }

    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      return;
    }

    if (event.key === "Backspace" && !inputValue && tags.length) {
      removeTag(tags[tags.length - 1].id);
      return;
    }

    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();

    if (
      activeSuggestionIndex >= 0 &&
      activeSuggestionIndex < matchingTags.length
    ) {
      addTag(matchingTags[activeSuggestionIndex]);
      return;
    }

    addInputValue();
  };

  return (
    <div className="space-y-1">
      <Popover open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <PopoverAnchor asChild>
          <div
            ref={tagInputContainerRef}
            className="flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border bg-transparent px-2 py-1 text-sm transition focus-within:ring-1 focus-within:ring-muted-foreground/30"
          >
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex h-8 items-center rounded-md bg-gray-300 pl-2 text-sm text-text"
              >
                {tag.text}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-transparent hover:text-slate-600"
                  aria-label={`Remove ${tag.text}`}
                  onClick={() => removeTag(tag.id)}
                >
                  <X />
                </Button>
              </span>
            ))}

            <Input
              id="tags"
              type="text"
              value={inputValue}
              role="combobox"
              aria-autocomplete="list"
              aria-controls={suggestionsId}
              aria-expanded={suggestionsOpen}
              placeholder={
                tags.length ? "Add another tag" : "Type or choose a tag"
              }
              className="h-8 min-w-36 flex-1 border-0 bg-transparent px-1 py-0 shadow-none focus-visible:ring-0"
              onFocus={() => setSuggestionsOpen(true)}
              onChange={(event) => {
                setInputValue(event.target.value);
                setActiveSuggestionIndex(-1);
                setSuggestionsOpen(true);
              }}
              onKeyDown={handleKeyDown}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={
                !normalizedInput || selectedTagNames.has(normalizedInput)
              }
              aria-label="Add tag"
              onClick={addInputValue}
            >
              <Plus />
            </Button>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] overflow-hidden p-1"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (
              tagInputContainerRef.current?.contains(event.target as Node)
            ) {
              event.preventDefault();
            }
          }}
        >
          <div
            id={suggestionsId}
            role="listbox"
            className="max-h-52 touch-pan-y overflow-y-scroll overscroll-contain [scrollbar-width:thin]"
            onWheel={(event) => event.stopPropagation()}
          >
            {matchingTags.length > 0 && (
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Existing tags
              </p>
            )}

            {matchingTags.map((tag, index) => (
              <button
                key={tag.id}
                type="button"
                role="option"
                aria-selected={activeSuggestionIndex === index}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition hover:bg-slate-100 ${
                  activeSuggestionIndex === index ? "bg-slate-100" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(tag)}
              >
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                {tag.text}
              </button>
            ))}

            {canCreateTag && (
              <button
                type="button"
                role="option"
                aria-selected={activeSuggestionIndex === matchingTags.length}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition hover:bg-slate-100 ${
                  activeSuggestionIndex === matchingTags.length
                    ? "bg-slate-100"
                    : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addInputValue()}
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
                Create &quot;{inputValue.trim()}&quot;
              </button>
            )}

            {!matchingTags.length && !canCreateTag && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                {normalizedInput
                  ? "Tag already selected."
                  : "No tags available."}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        Choose an existing tag or type a new one. Use +, Enter, or comma to add
        it; spaces are allowed.
      </p>
    </div>
  );
};
