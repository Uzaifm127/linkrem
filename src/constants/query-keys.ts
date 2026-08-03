export const linkQueryKey = "links";
export const tagQueryKey = "tags";
export const sessionQueryKey = "sessions";

export const getTagQueryKey = (userId?: string) =>
  [tagQueryKey, userId] as const;
