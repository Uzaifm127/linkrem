export const tagsParser = (
  tags: string
): Array<{ tagName: string }> | undefined => {
  const rawWords = tags.split(",");

  const pureWords = rawWords
    .filter((word) => !!word.trim())
    .map((word) => word.trim());

  // Prevention of creating duplicating characters
  const pureWordsSet = new Set(pureWords);

  const pureWordsObjectArray = Array.from(pureWordsSet).map((word) => ({
    tagName: word,
  }));

  return pureWordsObjectArray.length > 0 ? pureWordsObjectArray : undefined;
};
