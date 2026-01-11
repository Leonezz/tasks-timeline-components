import type { AppSettings, DateGroupBy, FontSize, ThemeOption } from "@/types";
import { ThemeSection } from "./ThemeSection";
import { TypographySection } from "./TypographySection";
import { ViewSection } from "./ViewSection";
import { DATE_FORMATS } from "./ViewSectionConstants";
import { useState } from "react";

interface SettingsPageGeneralProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  availableCategories: string[];
}

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
    toggleDefaultFocus = () =>
      onUpdateSettings({
        ...settings,
        defaultFocusMode: !settings.defaultFocusMode,
      }),
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
      </div>
    </>
  );
};
