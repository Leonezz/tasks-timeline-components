import { createContext, useContext } from "react";

// Context to provide the portal container inside Shadow DOM
export interface PortalContextValue {
  portalContainer: HTMLDivElement | null;
}

/** The value outside any AppProvider, told apart by identity. */
const NO_PORTAL_PROVIDER: PortalContextValue = { portalContainer: null };

export const PortalContext =
  createContext<PortalContextValue>(NO_PORTAL_PROVIDER);

export const usePortalContainer = () => {
  const context = useContext(PortalContext);
  return context.portalContainer;
};

/**
 * Whether an AppProvider supplies a portal container. Its container is null
 * until it attaches, which this does not change.
 */
export const useHasPortalProvider = () =>
  useContext(PortalContext) !== NO_PORTAL_PROVIDER;
