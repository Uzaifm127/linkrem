// extends work as a type constraint here
export const tagsParser = <Type extends boolean>(
  tags: string,
  raw: Type
):
  | (Type extends true ? Array<string> : Array<{ tagName: string }>)
  | undefined => {
  let wordsArray = [];

  const rawWords = tags.split(",");

  const pureWords = rawWords
    .filter((word) => !!word.trim())
    .map((word) => word.trim());

  // Prevention of creating duplicating characters
  const pureWordsSet = new Set(pureWords);

  if (raw) {
    wordsArray = Array.from(pureWordsSet);
  } else {
    wordsArray = Array.from(pureWordsSet).map((word) => ({
      tagName: word,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return wordsArray.length > 0 ? (wordsArray as any) : undefined;
};

export const normalizeUrl = (url: string): string => {
  return url.endsWith("/") && url.length > 1 ? url.slice(0, -1) : url;
};
