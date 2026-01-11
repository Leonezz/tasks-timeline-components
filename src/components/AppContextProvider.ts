import { createContext, useContext } from "react";

interface AppContextType {
  portalContainer: HTMLElement | null;
}

export const AppContext = createContext<AppContextType>({
  portalContainer: null,
});

export const useAppContext = () => useContext(AppContext);
