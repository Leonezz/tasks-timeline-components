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
}) => (
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

          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-paper rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] text-slate-900"
          >
            <SettingsPage
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              availableCategories={availableCategories}
              availableTags={availableTags}
              onClose={onClose}
              inSeperatePage={false}
            />
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
