import React from "react";
import root from "react-shadow";
import styles from "../index.css?inline";

export const AppProvider: React.FC<{
  children: React.ReactNode;
  theme?: string;
}> = ({ children, theme }) => {
  return (
    <root.div
      id="tasks-timeline-app"
      className="tasks-timeline-app"
      data-theme={theme}
    >
      <style>{styles}</style>
      {children}
    </root.div>
  );
};
