import type { AppSettings, SettingsRepository } from "../types";
import { logger } from "./logger";

export interface SettingsPersistenceError {
  kind: "load" | "save";
  title: string;
  description: string;
  error: unknown;
}

export type SettingsLoadResult =
  | { ok: true; settings: AppSettings | null }
  | { ok: false };

export interface SettingsPersistence {
  /** Loads settings. A null result (first run) counts as a successful load. */
  load(): Promise<SettingsLoadResult>;
  /** Saves settings only after a successful load; never rejects. */
  persist(settings: AppSettings): Promise<void>;
  /**
   * Marks loading as failed after `load()` itself succeeded, e.g. when the
   * loaded settings can't be merged or migrated. Same effect as a failed load.
   */
  failLoad(error: unknown): void;
  /** Whether saves are currently allowed. */
  canPersist(): boolean;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Guards settings persistence so that a failed load never leads to stored
 * settings being overwritten with defaults.
 *
 * - After a failed load, persistence is disabled for the rest of the session
 *   (the app keeps working with in-memory defaults) and `onError` is called once.
 * - A rejected save is caught and reported through `onError` once per distinct
 *   error message, so it never becomes an unhandled rejection.
 */
export function createSettingsPersistence(
  repo: SettingsRepository,
  onError: (error: SettingsPersistenceError) => void,
): SettingsPersistence {
  let loadSucceeded = false;
  let loadFailed = false;
  const reportedSaveErrors = new Set<string>();

  const canPersist = () => loadSucceeded && !loadFailed;

  const failLoad = (error: unknown) => {
    logger.error("App", "Failed to load settings", error);
    const firstFailure = !loadFailed;
    loadFailed = true;
    if (firstFailure) {
      onError({
        kind: "load",
        title: "Settings could not be loaded",
        description: `Using default settings for this session; changes will not be saved. ${describeError(error)}`,
        error,
      });
    }
  };

  return {
    canPersist,
    failLoad,

    async load() {
      try {
        const settings = await repo.loadSettings();
        loadSucceeded = true;
        return { ok: true, settings };
      } catch (error) {
        failLoad(error);
        return { ok: false };
      }
    },

    async persist(settings) {
      if (!canPersist()) return;
      try {
        await repo.saveSettings(settings);
      } catch (error) {
        logger.error("App", "Failed to save settings", error);
        const message = describeError(error);
        if (!reportedSaveErrors.has(message)) {
          reportedSaveErrors.add(message);
          onError({
            kind: "save",
            title: "Settings could not be saved",
            description: message,
            error,
          });
        }
      }
    },
  };
}
