import { describe, expect, it, vi } from "vitest";
import type { AppSettings, SettingsRepository } from "../types";
import { DEFAULT_SETTINGS } from "../defaultSettings";
import { createSettingsPersistence } from "./settings-persistence";

function makeRepo(overrides: Partial<SettingsRepository> = {}) {
  const repo = {
    name: "test",
    loadSettings: vi.fn<SettingsRepository["loadSettings"]>(async () => null),
    saveSettings: vi.fn<SettingsRepository["saveSettings"]>(async () => {}),
    ...overrides,
  };
  return repo;
}

const changed = (theme: AppSettings["theme"]): AppSettings => ({
  ...DEFAULT_SETTINGS,
  theme,
});

describe("createSettingsPersistence", () => {
  it("does not save anything after a failed load, and reports the failure once", async () => {
    const repo = makeRepo({
      loadSettings: vi.fn(async () => {
        throw new Error("vault unreadable");
      }),
    });
    const onError = vi.fn();
    const persistence = createSettingsPersistence(repo, onError);

    await expect(persistence.load()).resolves.toEqual({ ok: false });
    await persistence.persist(DEFAULT_SETTINGS);
    await persistence.persist(changed("dark"));
    await persistence.load(); // a later failure is not reported again

    expect(repo.saveSettings).not.toHaveBeenCalled();
    expect(persistence.canPersist()).toBe(false);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "load",
        title: "Settings could not be loaded",
        description: expect.stringContaining("vault unreadable"),
      }),
    );
  });

  it("keeps persistence disabled even if a later load succeeds", async () => {
    let fail = true;
    const repo = makeRepo({
      loadSettings: vi.fn(async () => {
        if (fail) throw new Error("transient");
        return DEFAULT_SETTINGS;
      }),
    });
    const persistence = createSettingsPersistence(repo, vi.fn());

    await persistence.load();
    fail = false;
    await persistence.load();
    await persistence.persist(changed("dark"));

    expect(repo.saveSettings).not.toHaveBeenCalled();
  });

  it("treats a null load (first run) as success and saves changes", async () => {
    const repo = makeRepo();
    const onError = vi.fn();
    const persistence = createSettingsPersistence(repo, onError);

    await expect(persistence.load()).resolves.toEqual({
      ok: true,
      settings: null,
    });
    await persistence.persist(changed("dark"));

    expect(repo.saveSettings).toHaveBeenCalledWith(changed("dark"));
    expect(onError).not.toHaveBeenCalled();
  });

  it("does not save before load has completed", async () => {
    const repo = makeRepo();
    const persistence = createSettingsPersistence(repo, vi.fn());

    await persistence.persist(changed("dark"));

    expect(repo.saveSettings).not.toHaveBeenCalled();
  });

  it("returns loaded settings and saves afterwards", async () => {
    const stored = changed("coffee");
    const repo = makeRepo({ loadSettings: vi.fn(async () => stored) });
    const persistence = createSettingsPersistence(repo, vi.fn());

    await expect(persistence.load()).resolves.toEqual({
      ok: true,
      settings: stored,
    });
    await persistence.persist(changed("dark"));

    expect(repo.saveSettings).toHaveBeenCalledOnce();
  });

  it("disables saving when loaded settings later fail to apply", async () => {
    const repo = makeRepo({
      loadSettings: vi.fn(async () => ({ ...DEFAULT_SETTINGS })),
    });
    const onError = vi.fn();
    const persistence = createSettingsPersistence(repo, onError);

    expect((await persistence.load()).ok).toBe(true);
    persistence.failLoad(new Error("cannot migrate"));
    persistence.failLoad(new Error("cannot migrate again"));
    await persistence.persist(changed("dark"));

    expect(repo.saveSettings).not.toHaveBeenCalled();
    expect(persistence.canPersist()).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({ kind: "load" });
  });

  it("catches a rejected save and reports each distinct error once", async () => {
    const saveErrors = ["disk full", "disk full", "permission denied"];
    const repo = makeRepo({
      saveSettings: vi.fn(async () => {
        throw new Error(saveErrors.shift());
      }),
    });
    const onError = vi.fn();
    const persistence = createSettingsPersistence(repo, onError);
    await persistence.load();

    await expect(persistence.persist(changed("dark"))).resolves.toBeUndefined();
    await expect(
      persistence.persist(changed("light")),
    ).resolves.toBeUndefined();
    await expect(
      persistence.persist(changed("coffee")),
    ).resolves.toBeUndefined();

    expect(repo.saveSettings).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        kind: "save",
        title: "Settings could not be saved",
        description: "disk full",
      }),
    );
    expect(onError).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        kind: "save",
        description: "permission denied",
      }),
    );
  });
});
