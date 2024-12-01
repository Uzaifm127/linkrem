import { create } from "zustand";
import { AllLinksAPIResponse } from "./types/server/response";

interface AppState {
  linkData: AllLinksAPIResponse | undefined;
  tagMutationLoading: boolean;
  headerHeight: number;
  setLinkData: (linkData: AllLinksAPIResponse | undefined) => void;
  setTagMutationLoading: (loading: boolean) => void;
  setHeaderHeight: (height: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  linkData: undefined,
  // For loading of modifying of tags while updating the link
  tagMutationLoading: false,
  headerHeight: 0,
  setLinkData: (linkData) => set(() => ({ linkData })),
  setTagMutationLoading: (loading) =>
    set(() => ({ tagMutationLoading: loading })),
  setHeaderHeight: (height) => set(() => ({ headerHeight: height })),
}));
