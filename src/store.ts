import { create } from "zustand";
import {
  AllLinksAPIResponse,
  AllSessionsAPIResponse,
} from "./types/server/response";

interface AppState {
  linkData: AllLinksAPIResponse | undefined;
  sessionData: AllSessionsAPIResponse | undefined;
  tagMutationLoading: boolean;
  headerHeight: number;
  setLinkData: (linkData: AllLinksAPIResponse | undefined) => void;
  setSessionData: (sessionData: AllSessionsAPIResponse | undefined) => void;
  setTagMutationLoading: (loading: boolean) => void;
  setHeaderHeight: (height: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  linkData: undefined,
  sessionData: undefined,
  // For loading of modifying of tags while updating the link
  tagMutationLoading: false,
  headerHeight: 0,
  setLinkData: (linkData) => set(() => ({ linkData })),
  setSessionData: (sessionData) => set(() => ({ sessionData })),
  setTagMutationLoading: (loading) =>
    set(() => ({ tagMutationLoading: loading })),
  setHeaderHeight: (height) => set(() => ({ headerHeight: height })),
}));
