import React, { useState } from "react";
import root from "react-shadow";
import styles from "../index.css?inline";
import { PortalContext } from "../hooks/usePortalContainer";

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
