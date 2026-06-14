import type { AppSettings, DateGroupBy, FontSize, ThemeOption } from "@/types";
import { ThemeSection } from "./ThemeSection";
import { TypographySection } from "./TypographySection";
import { ViewSection } from "./ViewSection";
import { DATE_FORMATS } from "./ViewSectionConstants";
import { useState } from "react";
import { cn } from "@/utils";
import { MotionSpan } from "../Motion";
import { Icon } from "../Icon";

interface SettingsPageGeneralProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  availableCategories: string[];
}

const INPUT_BAR_ITEMS = [
  {
    key: "settingButtonOnInputBar" as const,
    label: "Settings button",
    description: "Show settings gear icon",
    icon: "Settings" as const,
  },
  {
    key: "tagsFilterOnInputBar" as const,
    label: "Tags filter",
    description: "Show tags filter chips",
    icon: "Tag" as const,
  },
  {
    key: "categoriesFilterOnInputBar" as const,
    label: "Categories filter",
    description: "Show categories filter chips",
    icon: "Folder" as const,
  },
  {
    key: "priorityFilterOnInputBar" as const,
    label: "Priority filter",
    description: "Show priority filter chips",
    icon: "Flag" as const,
  },
  {
    key: "statusFilterOnInputBar" as const,
    label: "Status filter",
    description: "Show status filter chips",
    icon: "CircleDot" as const,
  },
  {
    key: "sortOnInputBar" as const,
    label: "Sort control",
    description: "Show sort options",
    icon: "ArrowUpDown" as const,
  },
];

export const SettingsPageGeneral = ({
  settings,
  onUpdateSettings,
  availableCategories,
}: SettingsPageGeneralProps) => {
  const setFontSize = (size: FontSize) =>
      onUpdateSettings({ ...settings, fontSize: size }),
    setTheme = (theme: ThemeOption) => onUpdateSettings({ ...settings, theme }),
    setDateFormat = (fmt: string) =>
      onUpdateSettings({ ...settings, dateFormat: fmt }),
    setDefaultCategory = (cat: string) =>
      onUpdateSettings({ ...settings, defaultCategory: cat }),
    // -- App Settings Handlers --
    toggleShowCompleted = () =>
      onUpdateSettings({ ...settings, showCompleted: !settings.showCompleted }),
    toggleRelativeDates = () =>
      onUpdateSettings({
        ...settings,
        useRelativeDates: !settings.useRelativeDates,
      }),
    toggleProgressBar = () =>
      onUpdateSettings({
        ...settings,
        showProgressBar: !settings.showProgressBar,
      }),
    toggleSound = () =>
      onUpdateSettings({
        ...settings,
        soundEnabled: !settings.soundEnabled,
      }),
    toggleDefaultFocus = () =>
      onUpdateSettings({
        ...settings,
        defaultFocusMode: !settings.defaultFocusMode,
      }),
    toggleInputBarItem = (
      key:
        | "settingButtonOnInputBar"
        | "tagsFilterOnInputBar"
        | "categoriesFilterOnInputBar"
        | "priorityFilterOnInputBar"
        | "statusFilterOnInputBar"
        | "sortOnInputBar",
    ) => {
      const current = settings[key] !== false;
      onUpdateSettings({ ...settings, [key]: !current });
    },
    toggleGroupingStrategy = (s: DateGroupBy) => {
      const current = settings.groupingStrategy,
        exists = current.includes(s);

      let newList: DateGroupBy[];
      if (exists) {
        if (current.length === 1) {
          return;
        }
        newList = current.filter((item) => item !== s);
      } else {
        newList = [...current, s];
      }
      onUpdateSettings({ ...settings, groupingStrategy: newList });
    },
    [isCustomFormat, setIsCustomFormat] = useState(
      !DATE_FORMATS.some(
        (f: { value: string }) => f.value === settings.dateFormat,
      ),
    );

  return (
    <>
      <div className="p-6 space-y-8">
        {/* Theme Section */}
        <section>
          <ThemeSection theme={settings.theme} setTheme={setTheme} />
        </section>

        {/* Typography */}
        <section>
          <TypographySection
            fontSize={settings.fontSize}
            setFontSize={setFontSize}
          />
        </section>

        {/* View Options */}
        <section>
          <ViewSection
            showCompleted={settings.showCompleted}
            toggleShowCompleted={toggleShowCompleted}
            useRelativeDates={settings.useRelativeDates}
            toggleRelativeDates={toggleRelativeDates}
            showProgressBar={settings.showProgressBar}
            toggleProgressBar={toggleProgressBar}
            soundEnabled={settings.soundEnabled}
            toggleSound={toggleSound}
            defaultFocusMode={settings.defaultFocusMode}
            toggleDefaultFocus={toggleDefaultFocus}
            dateFormat={settings.dateFormat}
            setDateFormat={setDateFormat}
            isCustomFormat={isCustomFormat}
            setIsCustomFormat={setIsCustomFormat}
            defaultCategory={settings.defaultCategory}
            setDefaultCategory={setDefaultCategory}
            availableCategories={availableCategories}
            groupingStrategy={settings.groupingStrategy}
            toggleGroupingStrategy={toggleGroupingStrategy}
          />
        </section>

        {/* Input Bar */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Icon name="PanelBottom" size={12} className="text-blue-500" />
            Input bar
          </h3>
          <div className="space-y-4">
            {INPUT_BAR_ITEMS.map((item) => {
              const isEnabled = settings[item.key] !== false;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      name={item.icon}
                      size={14}
                      className="text-slate-400"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleInputBarItem(item.key)}
                    aria-label={`${isEnabled ? "Hide" : "Show"} ${item.label.toLowerCase()} on input bar`}
                    aria-pressed={isEnabled}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                      isEnabled
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-700",
                    )}
                  >
                    <MotionSpan
                      layout
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                      animate={{ x: isEnabled ? 16 : 0 }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};
