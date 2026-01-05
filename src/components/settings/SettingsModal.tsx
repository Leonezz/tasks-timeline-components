import React from "react";
import { AnimatePresence } from "framer-motion";
import type { AppSettings } from "../../types";
import { MotionDiv } from "../Motion";
import { SettingsPage } from "./SettingsPage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;

  availableTags: string[];
  availableCategories: string[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,

  availableTags,
  availableCategories,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />

          <SettingsPage
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            availableCategories={availableCategories}
            availableTags={availableTags}
            onClose={onClose}
            inSeperatePage={false}
          />
        </>
      )}
    </AnimatePresence>
  );
};
