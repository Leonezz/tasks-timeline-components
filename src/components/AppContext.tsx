import React, { createContext, useContext, useState } from "react";
import root from "react-shadow";
import styles from "../index.css?inline";

// Context to provide the portal container inside Shadow DOM
interface PortalContextValue {
  portalContainer: HTMLDivElement | null;
}

const PortalContext = createContext<PortalContextValue>({
  portalContainer: null,
});

export const usePortalContainer = () => {
  const context = useContext(PortalContext);
  return context.portalContainer;
};

export const AppProvider: React.FC<{
  children: React.ReactNode;
  theme?: string;
}> = ({ children, theme }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <root.div
      id="tasks-timeline-app"
      className="tasks-timeline-app"
      data-theme={theme}
    >
      <style>{styles}</style>
      <PortalContext.Provider value={{ portalContainer }}>
        {children}
        {/* Portal container inside Shadow DOM for popovers/modals */}
        <div
          ref={setPortalContainer}
          id="portal-root"
          className="tasks-timeline-app"
          data-theme={theme}
        />
      </PortalContext.Provider>
    </root.div>
  );
};
