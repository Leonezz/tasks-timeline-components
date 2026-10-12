import { useMemo, useState } from "react";
import type { SettingsRepository } from "../types";
import { createSettingsPersistence } from "../utils/settings-persistence";
import type {
  SettingsPersistence,
  SettingsPersistenceError,
} from "../utils/settings-persistence";

/**
 * Wraps a SettingsRepository so that a failed load disables persistence for
 * the session and load/save failures are exposed as state for the UI to show.
 */
export function useSettingsPersistence(repo: SettingsRepository): {
  persistence: SettingsPersistence;
  error: SettingsPersistenceError | null;
} {
  const [error, setError] = useState<SettingsPersistenceError | null>(null);
  const persistence = useMemo(
    () => createSettingsPersistence(repo, setError),
    [repo],
  );
  return { persistence, error };
}
