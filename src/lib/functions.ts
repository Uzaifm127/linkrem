export const tagsParser = (tags: string) => {
  const rawWords = tags.split(",");

  const pureWords = rawWords.filter((word) => !!word.trim());

  const pureWordsObjectArray = pureWords.map((word) => ({
    tagName: word.trim(),
  }));

  return pureWordsObjectArray.length > 0 ? pureWordsObjectArray : undefined;
};
