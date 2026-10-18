import React, { useMemo, useState } from "react";
import styles from "../index.css?inline";
import { PortalContext } from "../hooks/usePortalContainer";

export const AppProvider: React.FC<{
  children: React.ReactNode;
  theme?: string;
}> = ({ children, theme }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  // Stable, so the ~6 popover wrappers per task row don't re-render with
  // every app render
  const portalValue = useMemo(() => ({ portalContainer }), [portalContainer]);

  return (
    <div
      id="tasks-timeline-app"
      className="tasks-timeline-app"
      data-theme={theme}
    >
      <style>{styles}</style>
      <div className="tasks-timeline-app contents" data-theme={theme}>
        <PortalContext.Provider value={portalValue}>
          {children}
          {/* Portal container inside Shadow DOM for popovers/modals */}
          <div
            ref={setPortalContainer}
            id="portal-root"
            className="tasks-timeline-app"
            data-theme={theme}
          />
        </PortalContext.Provider>
      </div>
    </div>
  );
};
