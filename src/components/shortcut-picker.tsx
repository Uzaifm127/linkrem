"use client";

import React, { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  createShortcut,
  createShortcutFromKeyboardEvent,
  formatShortcut,
  getShortcutParts,
  shortcutKeyRows,
  shortcutModifiers,
  ShortcutModifier,
  validateShortcut,
} from "@/lib/shortcut";
import { cn } from "@/lib/utils";

interface ShortcutPickerProps {
  value: string;
  onChange: (shortcut: string) => void;
  disabled?: boolean;
}

const ShortcutPicker = ({
  value,
  onChange,
  disabled = false,
}: ShortcutPickerProps) => {
  const [open, setOpen] = useState(false);
  const [draftShortcut, setDraftShortcut] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState<
    ShortcutModifier[]
  >([]);

  const { toast } = useToast();

  const showShortcutError = (message: string) => {
    toast({ title: message, variant: "destructive" });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const shortcut = validateShortcut(value, { optional: true }).shortcut;
      setDraftShortcut(shortcut);
      setSelectedModifiers(getShortcutParts(shortcut).modifiers);
    }

    setOpen(nextOpen);
  };

  const registerShortcut = (
    result: ReturnType<typeof createShortcut>
  ) => {
    if (!result.valid) {
      showShortcutError(result.message ?? "Invalid shortcut.");
      return;
    }

    setDraftShortcut(result.shortcut);
    setSelectedModifiers(getShortcutParts(result.shortcut).modifiers);
  };

  const handlePhysicalKeyboard = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.repeat || ["Escape", "Tab", "Enter", " "].includes(event.key)) {
      return;
    }

    const result = createShortcutFromKeyboardEvent(event.nativeEvent);

    if (!result) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    registerShortcut(result);
  };

  const toggleModifier = (modifier: ShortcutModifier) => {
    setSelectedModifiers((currentModifiers) =>
      currentModifiers.includes(modifier)
        ? currentModifiers.filter(
            (currentModifier) => currentModifier !== modifier
          )
        : shortcutModifiers.filter(
            (currentModifier) =>
              currentModifiers.includes(currentModifier) ||
              currentModifier === modifier
          )
    );
    setDraftShortcut("");
  };

  const saveShortcut = () => {
    const result = validateShortcut(draftShortcut);

    if (!result.valid) {
      showShortcutError(result.message ?? "Invalid shortcut.");
      return;
    }

    onChange(result.shortcut);
    setOpen(false);
  };

  const removeShortcut = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start bg-white text-text hover:bg-slate-100 hover:text-text"
        >
          <Keyboard />
          <span>
            {value
              ? formatShortcut(value)
              : disabled
                ? "Shortcut limit reached"
                : "Add shortcut"}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {value ? "Change" : disabled ? "10 maximum" : "Optional"}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-2xl"
        onKeyDown={handlePhysicalKeyboard}
      >
        <DialogHeader>
          <DialogTitle>Set keyboard shortcut</DialogTitle>
          <DialogDescription>
            Press a shortcut on your keyboard or choose the keys below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-20 items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted p-4">
          {draftShortcut ? (
            formatShortcut(draftShortcut).split(" + ").map((key) => (
              <span
                key={key}
                className="min-w-10 rounded-md border bg-white px-3 py-2 text-center font-medium shadow-sm"
              >
                {key}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              Waiting for a shortcut
            </span>
          )}
        </div>

        <div className="space-y-3 rounded-lg border bg-white p-3">
          <div className="flex flex-wrap justify-center gap-2">
            {shortcutModifiers.map((modifier) => (
              <Button
                key={modifier}
                type="button"
                size="sm"
                variant={
                  selectedModifiers.includes(modifier) ? "default" : "outline"
                }
                className={cn(
                  "min-w-16",
                  !selectedModifiers.includes(modifier) &&
                    "text-text hover:text-background"
                )}
                onClick={() => toggleModifier(modifier)}
              >
                {formatShortcut(modifier)}
              </Button>
            ))}
          </div>

          <div className="space-y-1.5">
            {shortcutKeyRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1.5">
                {row.map((key) => (
                  <Button
                    key={key}
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 bg-white p-0 text-xs text-text hover:text-background sm:h-9 sm:w-9 sm:text-sm"
                    onClick={() =>
                      registerShortcut(createShortcut(selectedModifiers, key))
                    }
                  >
                    {key.toUpperCase()}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Use Ctrl, Alt, or Meta with one letter or number. Shift is optional.
          Browser or operating-system shortcuts may take priority.
        </p>

        <DialogFooter>
          {value && (
            <Button type="button" variant="ghost" onClick={removeShortcut}>
              Remove shortcut
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="text-text hover:text-background"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!draftShortcut}
            onClick={saveShortcut}
          >
            Use shortcut
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutPicker;
