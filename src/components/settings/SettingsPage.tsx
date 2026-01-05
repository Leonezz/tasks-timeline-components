import { useState } from "react";
import { Icon } from "../Icon";
import type { AppSettings } from "../../types";
import { cn } from "../../utils";
import { MotionDiv } from "../Motion";
import { SettingsPageGeneral } from "./SettingsPageGeneral";
import { SettingsPageAdvanced } from "./SettingsPageAdvanced";
import { Documentation } from "./Documentation";
import root from "react-shadow";
import styles from "../../index.css?inline";

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;

  availableTags: string[];
  availableCategories: string[];
  onClose?: () => void;
  inSeperatePage: boolean;
}

type Tab = "general" | "advanced" | "docs";

export const SettingsPage = ({
  settings,
  onUpdateSettings,
  availableCategories,
  availableTags,
  onClose,
  inSeperatePage,
}: SettingsPageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const renderContent = () => (
    <>
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-paper rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] text-slate-900"
      >
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
                    : "text-slate-500 hover:text-slate-700"
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
                    : "text-slate-500 hover:text-slate-700"
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
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Docs
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800 shrink-0">
          <p className="text-[10px] text-slate-400">
            Timeline Tasks View • v0.1.3
          </p>
        </div>
      </MotionDiv>
    </>
  );

  if (inSeperatePage) {
    return (
      <root.div id="tasks-timeline-app">
        <style>{styles}</style>
        {renderContent()}
      </root.div>
    );
  }

  return renderContent();
};
