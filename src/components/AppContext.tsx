import React, { createContext, useContext } from "react";
import root from "react-shadow";
import styles from "../index.css?inline";

interface AppContextType {
  portalContainer: HTMLElement | null;
}

const AppContext = createContext<AppContextType>({ portalContainer: null });

export const AppProvider: React.FC<{
  container: HTMLElement | null;
  children: React.ReactNode;
}> = ({ container, children }) => {
  return (
    <root.div id="tasks-timeline-app">
      <style>{styles}</style>
      <AppContext.Provider value={{ portalContainer: container }}>
        {children}
      </AppContext.Provider>
    </root.div>
  );
};

export const useAppContext = () => useContext(AppContext);
