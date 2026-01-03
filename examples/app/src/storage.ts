import type {
  Task,
  TaskRepository,
  SettingsRepository,
  AppSettings,
} from "@tasks-timeline/components";
import { logger } from "./utils";

/**
 * LocalStorage implementation of the TaskRepository.
 * Includes a simple debounce to avoid excessive writes during rapid updates.
 */
export class BrowserTaskRepository implements TaskRepository {
  readonly name = "Local Browser Storage (Tasks)";
  private tasksKey = "tasks_timeline_tasks_data";

  private tasksSaveTimeout: number | null = null;

  async loadTasks(): Promise<Task[]> {
    const data = localStorage.getItem(this.tasksKey);
    if (!data) {
      logger().debug(
        "Storage",
        "No existing task data found in local storage."
      );
      return [];
    }
    try {
      const parsed = JSON.parse(data);
      logger().debug(
        "Storage",
        `Loaded ${parsed.length} tasks from local storage.`
      );
      return parsed;
    } catch (e) {
      logger().error("Storage", "Corrupt task data in local storage", e);
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    if (this.tasksSaveTimeout) window.clearTimeout(this.tasksSaveTimeout);

    return new Promise((resolve) => {
      this.tasksSaveTimeout = window.setTimeout(() => {
        try {
          localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
          logger().debug("Storage", `Persisted ${tasks.length} tasks.`);
          this.tasksSaveTimeout = null;
          resolve();
        } catch (e) {
          logger().error("Storage", "Failed to save tasks", e);
          resolve();
        }
      }, 500); // 500ms debounce
    });
  }

  async updateTask(task: Task): Promise<void> {
    const tasks = await this.loadTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      await this.saveTasks(tasks);
    }
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.loadTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.saveTasks(filtered);
  }
}

/**
 * LocalStorage implementation of the SettingsRepository.
 */
export class BrowserSettingsRepository implements SettingsRepository {
  readonly name = "Local Browser Settings";
  private settingsKey = "tasks_timeline_settings_data";
  private settingsSaveTimeout: number | null = null;

  async loadSettings(): Promise<AppSettings | null> {
    const data = localStorage.getItem(this.settingsKey);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      logger().debug("Storage", "Loaded settings from local storage.");
      return parsed;
    } catch (e) {
      logger().error("Storage", "Failed to parse settings", e);
      return null;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (this.settingsSaveTimeout) window.clearTimeout(this.settingsSaveTimeout);

    return new Promise((resolve) => {
      this.settingsSaveTimeout = window.setTimeout(() => {
        try {
          localStorage.setItem(this.settingsKey, JSON.stringify(settings));
          logger().debug("Storage", "Persisted settings.");
          this.settingsSaveTimeout = null;
          resolve();
        } catch (e) {
          logger().error("Storage", "Failed to save settings", e);
          resolve();
        }
      }, 500);
    });
  }
}

/**
 * Mock Remote Repositories
 */
export class RemoteTaskRepository implements TaskRepository {
  readonly name = "Remote Cloud Sync (Tasks)";
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async loadTasks(): Promise<Task[]> {
    // return fetch(this.baseUrl + '/tasks').then(r => r.json());
    return [];
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    console.log(
      "Cloud Sync: Saving all tasks to ",
      this.baseUrl,
      ", tasks: ",
      tasks
    );
  }

  async updateTask(task: Task): Promise<void> {
    console.log("Cloud Sync: Updating task ", task.id);
  }

  async deleteTask(id: string): Promise<void> {
    console.log("Cloud Sync: Deleting task ", id);
  }
}

export class RemoteSettingsRepository implements SettingsRepository {
  readonly name = "Remote Cloud Sync (Settings)";
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async loadSettings(): Promise<AppSettings | null> {
    // return fetch(this.baseUrl + '/settings').then(r => r.json());
    return null;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    console.log("Cloud Sync: Saving settings: ", settings);
  }
}
