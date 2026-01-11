import React from "react";
import root from "react-shadow";
import styles from "../index.css?inline";
import { AppContext } from "./AppContextProvider";

export const AppProvider: React.FC<{
  container: HTMLElement | null;
  children: React.ReactNode;
}> = ({ container, children }) => (
  <root.div id="tasks-timeline-app">
    <style>{styles}</style>
    <AppContext.Provider value={{ portalContainer: container }}>
      {children}
    </AppContext.Provider>
  </root.div>
);
