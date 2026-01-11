import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import type { AppSettings } from "../../types";
import { cn } from "../../utils";
import { SettingsPageGeneral } from "./SettingsPageGeneral";
import { SettingsPageAdvanced } from "./SettingsPageAdvanced";
import { Documentation } from "./Documentation";
import root from "react-shadow";
import styles from "../../index.css?inline";
import "../../../vite-env.d.ts";
import { About } from "./About.tsx";
import { logger } from "@/utils/logger.ts";

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;

  availableTags: string[];
  availableCategories: string[];
  onClose?: () => void;
  inSeperatePage: boolean;
  inDarkMode?: boolean;
}

type Tab = "general" | "advanced" | "docs" | "about";

export const SettingsPage = ({
  settings,
  onUpdateSettings,
  availableCategories,
  availableTags,
  onClose,
  inSeperatePage,
  inDarkMode,
}: SettingsPageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("general"),
    [containerElement, setContainerElement] = useState<HTMLDivElement | null>(
      null,
    );
  useEffect(() => {
    logger.info(
      "Settings",
      `system in dark mode: ${inDarkMode}, in seperate page: ${inSeperatePage}, onClose: ${onClose}`,
    );
    if (!inSeperatePage || !containerElement) {
      return;
    }
    const theme = inDarkMode ? "midnight" : "light";
    logger.info("Settings", "adjust to system theme: ", theme);
    containerElement.setAttribute("data-theme", theme);
  }, [settings.theme, containerElement, inDarkMode, inSeperatePage, onClose]);
  const renderContent = () => (
    <>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-paper/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200">
              <Icon name="Settings" size={18} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Settings</h2>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "general"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "advanced"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Advanced
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "docs"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Docs
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "about"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              About
            </button>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors outline-none"
          >
            <Icon name="X" size={20} />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="p-0 overflow-y-auto flex-1 min-h-100">
        {activeTab === "general" && (
          <SettingsPageGeneral
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            availableCategories={availableCategories}
          />
        )}
        {activeTab === "advanced" && (
          <SettingsPageAdvanced
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            availableTags={availableTags}
          />
        )}
        {activeTab === "docs" && <Documentation />}
        {activeTab === "about" && <About />}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800 shrink-0">
        <p className="text-[10px] text-slate-400">
          Timeline Tasks View • {__APP_VERSION__} at {__COMMIT_HASH__}
        </p>
      </div>
    </>
  );

  if (inSeperatePage) {
    return (
      <div
        ref={setContainerElement}
        className="tasks-timeline-app"
        id="tasks-timeline-app"
        style={{
          width: "100%",
        }}
      >
        <root.div>
          <style>{styles}</style>
          {renderContent()}
        </root.div>
      </div>
    );
  }

  return renderContent();
};
