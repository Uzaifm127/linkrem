import { create } from "zustand";
import {
  AllLinksAPIResponse,
  AllSessionsAPIResponse,
  AllTagsAPIResponse,
} from "./types/server/response";

interface GlobalSearch {
  searchText: string;
  type: "links" | "sessions";
}

interface AppState {
  linkData: AllLinksAPIResponse | undefined;
  tagsData: AllTagsAPIResponse | undefined;
  sessionData: AllSessionsAPIResponse | undefined;
  globalSearch: GlobalSearch;
  tagMutationLoading: boolean;
  tagOpeningLoading: boolean;
  headerHeight: number;
  setLinkData: (linkData: AllLinksAPIResponse | undefined) => void;
  setTagsData: (tagsData: AllTagsAPIResponse | undefined) => void;
  setSessionData: (sessionData: AllSessionsAPIResponse | undefined) => void;
  setGlobalSearch: (globalSearchedObject: Partial<GlobalSearch>) => void;
  setTagMutationLoading: (loading: boolean) => void;
  setTagOpeningLoading: (loading: boolean) => void;
  setHeaderHeight: (height: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  linkData: undefined,
  tagsData: undefined,
  sessionData: undefined,
  globalSearch: {
    searchText: "",
    type: "links",
  },
  // For loading of modifying of tags while updating the link
  tagMutationLoading: false,
  tagOpeningLoading: false,
  headerHeight: 0,
  setLinkData: (linkData) => set(() => ({ linkData })),
  setTagsData: (tagsData) => set(() => ({ tagsData })),
  setSessionData: (sessionData) => set(() => ({ sessionData })),
  setGlobalSearch: (globalSearchedObject) =>
    set(({ globalSearch }) => ({
      globalSearch: { ...globalSearch, ...globalSearchedObject },
    })),
  setTagMutationLoading: (loading) =>
    set(() => ({ tagMutationLoading: loading })),
  setTagOpeningLoading: (loading) =>
    set(() => ({ tagOpeningLoading: loading })),
  setHeaderHeight: (height) => set(() => ({ headerHeight: height })),
}));
