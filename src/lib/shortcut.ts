export const shortcutKeyRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
] as const;

export const shortcutModifiers = ["ctrl", "alt", "shift", "meta"] as const;

export const maxLinkShortcuts = 10;

export type ShortcutModifier = (typeof shortcutModifiers)[number];

interface ShortcutValidationResult {
  valid: boolean;
  message?: string;
  shortcut: string;
}

const modifierAliases: Partial<Record<string, ShortcutModifier>> = {
  alt: "alt",
  option: "alt",
  control: "ctrl",
  ctrl: "ctrl",
  command: "meta",
  cmd: "meta",
  meta: "meta",
  shift: "shift",
};

const shortcutLabels: Record<string, string> = {
  alt: "Alt",
  ctrl: "Ctrl",
  meta: "Meta",
  shift: "Shift",
};

const isPrimaryKey = (key: string) => /^[a-z0-9]$/.test(key);

export const getShortcutParts = (shortcut: string) => {
  const tokens = shortcut
    .trim()
    .toLowerCase()
    .split(/[+\s]+/)
    .filter(Boolean)
    .map((token) => modifierAliases[token] ?? token);

  const modifiers = shortcutModifiers.filter((modifier) =>
    tokens.includes(modifier)
  );
  const keys = tokens.filter(
    (token) => !shortcutModifiers.includes(token as ShortcutModifier)
  );

  return { keys, modifiers, tokens };
};

export const validateShortcut = (
  shortcut: string,
  options: { optional?: boolean } = {}
): ShortcutValidationResult => {
  if (!shortcut.trim()) {
    return options.optional
      ? { valid: true, shortcut: "" }
      : {
          valid: false,
          message: "Choose at least one modifier and one letter or number.",
          shortcut: "",
        };
  }

  const { keys, modifiers, tokens } = getShortcutParts(shortcut);
  const knownTokenCount = keys.length + modifiers.length;

  if (knownTokenCount !== tokens.length || keys.length !== 1) {
    return {
      valid: false,
      message: "A shortcut can contain only one letter or number.",
      shortcut: "",
    };
  }

  const [key] = keys;

  if (!isPrimaryKey(key)) {
    return {
      valid: false,
      message: "Use a letter from A-Z or a number from 0-9.",
      shortcut: "",
    };
  }

  if (!modifiers.some((modifier) => modifier !== "shift")) {
    return {
      valid: false,
      message: "Add Ctrl, Alt, or Meta. Shift cannot be used by itself.",
      shortcut: "",
    };
  }

  const usesAppShortcut =
    modifiers.some((modifier) => modifier === "ctrl" || modifier === "meta") &&
    (key === "b" || key === "k");

  if (usesAppShortcut) {
    return {
      valid: false,
      message: `${formatShortcut(
        [...modifiers, key].join(" ")
      )} is already used by Linkrem.`,
      shortcut: "",
    };
  }

  const usesExtensionSaveShortcut =
    modifiers.includes("shift") &&
    modifiers.some((modifier) => modifier === "ctrl" || modifier === "meta") &&
    (key === "l" || key === "s");

  if (usesExtensionSaveShortcut) {
    return {
      valid: false,
      message: `${formatShortcut(
        [...modifiers, key].join(" "),
      )} is used to save from the Linkrem extension.`,
      shortcut: "",
    };
  }

  return {
    valid: true,
    shortcut: [...modifiers, key].join(" "),
  };
};

export const createShortcut = (
  modifiers: ReadonlyArray<ShortcutModifier>,
  key: string
) => validateShortcut([...modifiers, key.toLowerCase()].join(" "));

export const createShortcutFromKeyboardEvent = (
  event: Pick<
    KeyboardEvent,
    "altKey" | "code" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
  >
) => {
  const normalizedKey = event.code.startsWith("Key")
    ? event.code.slice(3).toLowerCase()
    : event.code.startsWith("Digit")
    ? event.code.slice(5)
    : event.key.toLowerCase();

  if (modifierAliases[normalizedKey]) {
    return null;
  }

  const modifiers = shortcutModifiers.filter((modifier) => {
    if (modifier === "ctrl") {
      return event.ctrlKey;
    }
    if (modifier === "alt") {
      return event.altKey;
    }
    if (modifier === "shift") {
      return event.shiftKey;
    }
    return event.metaKey;
  });

  return createShortcut(modifiers, normalizedKey);
};

export const formatShortcut = (shortcut: string) => {
  if (!shortcut.trim()) {
    return "";
  }

  const { keys, modifiers } = getShortcutParts(shortcut);

  return [...modifiers, ...keys]
    .map((key) => shortcutLabels[key] ?? key.toUpperCase())
    .join(" + ");
};

export const matchesShortcut = (
  event: Pick<
    KeyboardEvent,
    "altKey" | "code" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
  >,
  shortcut: string
) => {
  const eventShortcut = createShortcutFromKeyboardEvent(event);
  const savedShortcut = validateShortcut(shortcut);

  return (
    eventShortcut?.valid === true &&
    savedShortcut.valid &&
    eventShortcut.shortcut === savedShortcut.shortcut
  );
};
