import { create } from "zustand";
import { AllLinksAPIResponse } from "./types/server/response";

interface AppState {
  linkData: AllLinksAPIResponse | undefined;
  setLinkData: (linkData: AllLinksAPIResponse | undefined) => void;
}

export const useAppStore = create<AppState>((set) => ({
  linkData: undefined,
  setLinkData: (linkData) => set(() => ({ linkData })),
}));
