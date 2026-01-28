import { createContext, useContext } from "react";

// Context to provide the portal container inside Shadow DOM
export interface PortalContextValue {
  portalContainer: HTMLDivElement | null;
}

export const PortalContext = createContext<PortalContextValue>({
  portalContainer: null,
});

export const usePortalContainer = () => {
  const context = useContext(PortalContext);
  return context.portalContainer;
};
