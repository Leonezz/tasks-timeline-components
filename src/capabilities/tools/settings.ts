import type {
  AppSettings,
  DateGroupBy,
  FilterRule,
  FilterState,
  FontSize,
  Priority,
  SortDirection,
  SortField,
  SortState,
  TaskStatus,
  ThemeOption,
} from "../../types";
import type { JSONSchemaProperty } from "../../providers/types";
import type { CapabilityContext, ToolSpec } from "../types";

const THEMES: ThemeOption[] = ["light", "dark", "midnight", "coffee", "system"];
const FONT_SIZES: FontSize[] = ["sm", "base", "lg", "xl"];
const GROUPING_FIELDS: DateGroupBy[] = [
  "dueAt",
  "createdAt",
  "startAt",
  "completedAt",
];
const PRIORITIES: Priority[] = ["low", "medium", "high"];
const STATUSES: TaskStatus[] = [
  "todo",
  "doing",
  "done",
  "cancelled",
  "due",
  "overdue",
  "scheduled",
  "unplanned",
];
const SORT_FIELDS: SortField[] = [
  "createdAt",
  "dueAt",
  "startAt",
  "priority",
  "title",
  "custom",
];
const SORT_DIRECTIONS: SortDirection[] = ["asc", "desc"];

const DEFAULT_FILTERS: FilterState = {
  tags: { include: [], exclude: [] },
  categories: { include: [], exclude: [] },
  priorities: { include: [], exclude: [] },
  statuses: { include: [], exclude: [] },
  enableScript: false,
  script: "",
};

const DEFAULT_SORT: SortState = {
  field: "createdAt",
  direction: "asc",
  script: "",
};

type ManagedViewSettings = Pick<
  AppSettings,
  | "theme"
  | "dateFormat"
  | "showCompleted"
  | "showProgressBar"
  | "soundEnabled"
  | "fontSize"
  | "useRelativeDates"
  | "groupingStrategy"
  | "defaultFocusMode"
  | "defaultCategory"
  | "settingButtonOnInputBar"
  | "tagsFilterOnInputBar"
  | "categoriesFilterOnInputBar"
  | "priorityFilterOnInputBar"
  | "statusFilterOnInputBar"
  | "sortOnInputBar"
  | "filters"
  | "sort"
>;

type ApplyResult =
  | { ok: true; settings: AppSettings; changed: string[] }
  | { ok: false; error: string };

function stringEnumProperty(
  description: string,
  values: readonly string[],
): JSONSchemaProperty {
  return { type: "string", description, enum: [...values] };
}

function stringArrayProperty(
  description: string,
  values?: readonly string[],
): JSONSchemaProperty {
  return {
    type: "array",
    description,
    items: values ? { type: "string", enum: [...values] } : { type: "string" },
  };
}

function filterRuleProperty(
  description: string,
  values?: readonly string[],
): JSONSchemaProperty {
  return {
    type: "object",
    description,
    properties: {
      include: stringArrayProperty("Values to include.", values),
      exclude: stringArrayProperty("Values to exclude.", values),
    },
  };
}

function filterStateProperty(): JSONSchemaProperty {
  return {
    type: "object",
    description:
      "Persistent timeline filter settings. Include and exclude arrays are exact-match lists.",
    properties: {
      tags: filterRuleProperty("Tag filters."),
      categories: filterRuleProperty("Category filters."),
      priorities: filterRuleProperty("Priority filters.", PRIORITIES),
      statuses: filterRuleProperty("Status filters.", STATUSES),
      enableScript: {
        type: "boolean",
        description: "Whether the custom filter script is enabled.",
      },
      script: {
        type: "string",
        description: "Custom safe-expression filter script.",
      },
    },
  };
}

function sortStateProperty(): JSONSchemaProperty {
  return {
    type: "object",
    description: "Persistent timeline sort settings.",
    properties: {
      field: stringEnumProperty("Sort field.", SORT_FIELDS),
      direction: stringEnumProperty("Sort direction.", SORT_DIRECTIONS),
      script: {
        type: "string",
        description:
          "Custom safe-expression sort script. Used when field is custom.",
      },
    },
  };
}

function getSettings(ctx: CapabilityContext): AppSettings | null {
  return ctx.getSettings?.() ?? null;
}

function toManagedSettings(settings: AppSettings): ManagedViewSettings {
  return {
    theme: settings.theme,
    dateFormat: settings.dateFormat,
    showCompleted: settings.showCompleted,
    showProgressBar: settings.showProgressBar,
    soundEnabled: settings.soundEnabled,
    fontSize: settings.fontSize,
    useRelativeDates: settings.useRelativeDates,
    groupingStrategy: settings.groupingStrategy,
    defaultFocusMode: settings.defaultFocusMode,
    defaultCategory: settings.defaultCategory,
    settingButtonOnInputBar: settings.settingButtonOnInputBar,
    tagsFilterOnInputBar: settings.tagsFilterOnInputBar,
    categoriesFilterOnInputBar: settings.categoriesFilterOnInputBar,
    priorityFilterOnInputBar: settings.priorityFilterOnInputBar,
    statusFilterOnInputBar: settings.statusFilterOnInputBar,
    sortOnInputBar: settings.sortOnInputBar,
    filters: settings.filters,
    sort: settings.sort,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function readBoolean(
  args: Record<string, unknown>,
  key: string,
  patch: Partial<AppSettings>,
  changed: string[],
): ApplyResult | null {
  if (!hasOwn(args, key)) return null;
  if (typeof args[key] !== "boolean") {
    return { ok: false, error: `${key} must be a boolean` };
  }
  (patch as Record<string, unknown>)[key] = args[key];
  changed.push(key);
  return null;
}

function readString(
  args: Record<string, unknown>,
  key: string,
  patch: Partial<AppSettings>,
  changed: string[],
): ApplyResult | null {
  if (!hasOwn(args, key)) return null;
  if (typeof args[key] !== "string") {
    return { ok: false, error: `${key} must be a string` };
  }
  (patch as Record<string, unknown>)[key] = args[key];
  changed.push(key);
  return null;
}

function readEnum<T extends string>(
  args: Record<string, unknown>,
  key: string,
  values: readonly T[],
  patch: Partial<AppSettings>,
  changed: string[],
): ApplyResult | null {
  if (!hasOwn(args, key)) return null;
  if (typeof args[key] !== "string" || !values.includes(args[key] as T)) {
    return { ok: false, error: `${key} must be one of ${values.join(", ")}` };
  }
  (patch as Record<string, unknown>)[key] = args[key];
  changed.push(key);
  return null;
}

function readEnumArray<T extends string>(
  args: Record<string, unknown>,
  key: string,
  values: readonly T[],
  patch: Partial<AppSettings>,
  changed: string[],
): ApplyResult | null {
  if (!hasOwn(args, key)) return null;
  const value = args[key];
  if (
    !Array.isArray(value) ||
    value.some(
      (item) => typeof item !== "string" || !values.includes(item as T),
    )
  ) {
    return { ok: false, error: `${key} must contain ${values.join(", ")}` };
  }
  (patch as Record<string, unknown>)[key] = value;
  changed.push(key);
  return null;
}

function readStringArray(value: unknown, name: string): string[] | ApplyResult {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return { ok: false, error: `${name} must be an array of strings` };
  }
  return value;
}

function readLimitedArray<T extends string>(
  value: unknown,
  name: string,
  values: readonly T[],
): T[] | ApplyResult {
  if (
    !Array.isArray(value) ||
    value.some(
      (item) => typeof item !== "string" || !values.includes(item as T),
    )
  ) {
    return { ok: false, error: `${name} must contain ${values.join(", ")}` };
  }
  return value as T[];
}

function updateRule<T extends string>(
  current: FilterRule<T>,
  patch: unknown,
  name: string,
  values?: readonly T[],
): FilterRule<T> | ApplyResult {
  if (!isRecord(patch)) {
    return { ok: false, error: `${name} must be an object` };
  }
  let include = current.include;
  let exclude = current.exclude;

  if (hasOwn(patch, "include")) {
    const next = values
      ? readLimitedArray(patch.include, `${name}.include`, values)
      : readStringArray(patch.include, `${name}.include`);
    if (!Array.isArray(next)) return next;
    include = next as T[];
  }

  if (hasOwn(patch, "exclude")) {
    const next = values
      ? readLimitedArray(patch.exclude, `${name}.exclude`, values)
      : readStringArray(patch.exclude, `${name}.exclude`);
    if (!Array.isArray(next)) return next;
    exclude = next as T[];
  }

  return { include, exclude };
}

function buildFilters(
  current: FilterState,
  patch: unknown,
): FilterState | ApplyResult {
  if (!isRecord(patch)) {
    return { ok: false, error: "filters must be an object" };
  }

  const filters: FilterState = {
    tags: { ...current.tags },
    categories: { ...current.categories },
    priorities: { ...current.priorities },
    statuses: { ...current.statuses },
    enableScript: current.enableScript,
    script: current.script,
  };

  if (hasOwn(patch, "tags")) {
    const next = updateRule(filters.tags, patch.tags, "filters.tags");
    if ("ok" in next) return next;
    filters.tags = next;
  }
  if (hasOwn(patch, "categories")) {
    const next = updateRule(
      filters.categories,
      patch.categories,
      "filters.categories",
    );
    if ("ok" in next) return next;
    filters.categories = next;
  }
  if (hasOwn(patch, "priorities")) {
    const next = updateRule(
      filters.priorities,
      patch.priorities,
      "filters.priorities",
      PRIORITIES,
    );
    if ("ok" in next) return next;
    filters.priorities = next;
  }
  if (hasOwn(patch, "statuses")) {
    const next = updateRule(
      filters.statuses,
      patch.statuses,
      "filters.statuses",
      STATUSES,
    );
    if ("ok" in next) return next;
    filters.statuses = next;
  }
  if (hasOwn(patch, "enableScript")) {
    if (typeof patch.enableScript !== "boolean") {
      return { ok: false, error: "filters.enableScript must be a boolean" };
    }
    filters.enableScript = patch.enableScript;
  }
  if (hasOwn(patch, "script")) {
    if (typeof patch.script !== "string") {
      return { ok: false, error: "filters.script must be a string" };
    }
    filters.script = patch.script;
  }

  return filters;
}

function buildSort(
  current: SortState,
  patch: unknown,
): SortState | ApplyResult {
  if (!isRecord(patch)) {
    return { ok: false, error: "sort must be an object" };
  }

  const sort: SortState = { ...current };

  if (hasOwn(patch, "field")) {
    if (
      typeof patch.field !== "string" ||
      !SORT_FIELDS.includes(patch.field as SortField)
    ) {
      return {
        ok: false,
        error: `sort.field must be one of ${SORT_FIELDS.join(", ")}`,
      };
    }
    sort.field = patch.field as SortField;
  }
  if (hasOwn(patch, "direction")) {
    if (
      typeof patch.direction !== "string" ||
      !SORT_DIRECTIONS.includes(patch.direction as SortDirection)
    ) {
      return {
        ok: false,
        error: `sort.direction must be one of ${SORT_DIRECTIONS.join(", ")}`,
      };
    }
    sort.direction = patch.direction as SortDirection;
  }
  if (hasOwn(patch, "script")) {
    if (typeof patch.script !== "string") {
      return { ok: false, error: "sort.script must be a string" };
    }
    sort.script = patch.script;
  }

  return sort;
}

function buildViewSettingsUpdate(
  current: AppSettings,
  args: Record<string, unknown>,
): ApplyResult {
  const patch: Partial<AppSettings> = {};
  const changed: string[] = [];

  const readers: Array<ApplyResult | null> = [
    readEnum(args, "theme", THEMES, patch, changed),
    readString(args, "dateFormat", patch, changed),
    readBoolean(args, "showCompleted", patch, changed),
    readBoolean(args, "showProgressBar", patch, changed),
    readBoolean(args, "soundEnabled", patch, changed),
    readEnum(args, "fontSize", FONT_SIZES, patch, changed),
    readBoolean(args, "useRelativeDates", patch, changed),
    readEnumArray(args, "groupingStrategy", GROUPING_FIELDS, patch, changed),
    readBoolean(args, "defaultFocusMode", patch, changed),
    readString(args, "defaultCategory", patch, changed),
    readBoolean(args, "settingButtonOnInputBar", patch, changed),
    readBoolean(args, "tagsFilterOnInputBar", patch, changed),
    readBoolean(args, "categoriesFilterOnInputBar", patch, changed),
    readBoolean(args, "priorityFilterOnInputBar", patch, changed),
    readBoolean(args, "statusFilterOnInputBar", patch, changed),
    readBoolean(args, "sortOnInputBar", patch, changed),
  ];

  const error = readers.find(
    (result): result is ApplyResult => result !== null,
  );
  if (error) return error;

  if (hasOwn(args, "filters")) {
    const filters = buildFilters(current.filters, args.filters);
    if ("ok" in filters) return filters;
    patch.filters = filters;
    changed.push("filters");
  }
  if (hasOwn(args, "sort")) {
    const sort = buildSort(current.sort, args.sort);
    if ("ok" in sort) return sort;
    patch.sort = sort;
    changed.push("sort");
  }

  if (changed.length === 0) {
    return { ok: false, error: "No supported settings were provided" };
  }

  return { ok: true, settings: { ...current, ...patch }, changed };
}

async function applySettings(
  ctx: CapabilityContext,
  settings: AppSettings,
  changed: string[],
  confirmationTitle: string,
): Promise<{
  success: boolean;
  message: string;
  settings?: ManagedViewSettings;
}> {
  if (!ctx.updateSettings) {
    return {
      success: false,
      message: "This host does not allow the agent to update settings.",
    };
  }

  const confirmed = await ctx.confirm?.(
    confirmationTitle,
    `Change: ${changed.join(", ")}`,
  );
  if (confirmed === false || confirmed === null) {
    return { success: false, message: "Cancelled by user." };
  }

  await ctx.updateSettings(settings);
  ctx.showToast?.({
    variant: "success",
    title: "Updated view settings",
    description: `Changed ${changed.join(", ")}.`,
    timeout: 6000,
  });

  return {
    success: true,
    message: `Updated ${changed.join(", ")}.`,
    settings: toManagedSettings(settings),
  };
}

export function createGetViewSettingsTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "get_view_settings",
    description:
      "Read the current manageable timeline view settings. Provider credentials and secret fields are not returned.",
    schema: { type: "object", properties: {} },
    async execute() {
      const settings = getSettings(ctx);
      if (!settings) {
        return {
          name: "get_view_settings",
          result: { success: false, message: "Settings are unavailable." },
        };
      }
      return {
        name: "get_view_settings",
        result: { success: true, settings: toManagedSettings(settings) },
      };
    },
  };
}

export function createUpdateViewSettingsTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "update_view_settings",
    description:
      "Update persistent timeline display preferences such as date format, grouping, completed visibility, theme, input-bar controls, filters, and sort.",
    schema: {
      type: "object",
      properties: {
        theme: stringEnumProperty("Theme to use.", THEMES),
        dateFormat: {
          type: "string",
          description: "Date display format, for example MMM d or yyyy-MM-dd.",
        },
        showCompleted: {
          type: "boolean",
          description: "Whether completed tasks are visible.",
        },
        showProgressBar: {
          type: "boolean",
          description: "Whether year progress bars are visible.",
        },
        soundEnabled: {
          type: "boolean",
          description: "Whether app sounds are enabled.",
        },
        fontSize: stringEnumProperty("Timeline font size.", FONT_SIZES),
        useRelativeDates: {
          type: "boolean",
          description: "Whether relative date labels are used.",
        },
        groupingStrategy: stringArrayProperty(
          "Date fields used to group tasks.",
          GROUPING_FIELDS,
        ),
        defaultFocusMode: {
          type: "boolean",
          description: "Whether focus mode is enabled by default.",
        },
        defaultCategory: {
          type: "string",
          description: "Default category/path for newly created tasks.",
        },
        settingButtonOnInputBar: {
          type: "boolean",
          description: "Whether the settings button appears in the input bar.",
        },
        tagsFilterOnInputBar: {
          type: "boolean",
          description: "Whether the tags filter appears in the input bar.",
        },
        categoriesFilterOnInputBar: {
          type: "boolean",
          description:
            "Whether the categories filter appears in the input bar.",
        },
        priorityFilterOnInputBar: {
          type: "boolean",
          description: "Whether the priority filter appears in the input bar.",
        },
        statusFilterOnInputBar: {
          type: "boolean",
          description: "Whether the status filter appears in the input bar.",
        },
        sortOnInputBar: {
          type: "boolean",
          description: "Whether sort controls appear in the input bar.",
        },
        filters: filterStateProperty(),
        sort: sortStateProperty(),
      },
    },
    async execute(args) {
      const current = getSettings(ctx);
      if (!current) {
        return {
          name: "update_view_settings",
          result: { success: false, message: "Settings are unavailable." },
        };
      }

      const update = buildViewSettingsUpdate(current, args);
      if (!update.ok) {
        return { name: "update_view_settings", result: update };
      }

      return {
        name: "update_view_settings",
        result: await applySettings(
          ctx,
          update.settings,
          update.changed,
          "Update view settings?",
        ),
      };
    },
  };
}

export function createSetTaskFiltersTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "set_task_filters",
    description:
      "Replace or partially update the persistent timeline task filters for tags, categories, priorities, statuses, and custom filter script.",
    schema: {
      type: "object",
      properties: {
        filters: filterStateProperty(),
      },
      required: ["filters"],
    },
    async execute(args) {
      const current = getSettings(ctx);
      if (!current) {
        return {
          name: "set_task_filters",
          result: { success: false, message: "Settings are unavailable." },
        };
      }

      const filters = buildFilters(current.filters, args.filters);
      if ("ok" in filters) {
        return { name: "set_task_filters", result: filters };
      }

      return {
        name: "set_task_filters",
        result: await applySettings(
          ctx,
          { ...current, filters },
          ["filters"],
          "Update task filters?",
        ),
      };
    },
  };
}

export function createSetTaskSortTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "set_task_sort",
    description:
      "Update the persistent timeline sort field, direction, and optional custom sort script.",
    schema: {
      type: "object",
      properties: {
        field: stringEnumProperty("Sort field.", SORT_FIELDS),
        direction: stringEnumProperty("Sort direction.", SORT_DIRECTIONS),
        script: {
          type: "string",
          description:
            "Custom safe-expression sort script. Used when field is custom.",
        },
      },
    },
    async execute(args) {
      const current = getSettings(ctx);
      if (!current) {
        return {
          name: "set_task_sort",
          result: { success: false, message: "Settings are unavailable." },
        };
      }

      const sort = buildSort(current.sort, args);
      if ("ok" in sort) {
        return { name: "set_task_sort", result: sort };
      }

      return {
        name: "set_task_sort",
        result: await applySettings(
          ctx,
          { ...current, sort },
          ["sort"],
          "Update task sort?",
        ),
      };
    },
  };
}

export function createResetViewSettingsTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "reset_view_settings",
    description:
      "Reset persistent view settings. Scope can reset filters, sort, filters and sort, display preferences, or all manageable view settings.",
    schema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          description: "Which group of manageable settings to reset.",
          enum: ["filters", "sort", "filters_and_sort", "view", "all_view"],
        },
      },
      required: ["scope"],
    },
    async execute(args) {
      const current = getSettings(ctx);
      if (!current) {
        return {
          name: "reset_view_settings",
          result: { success: false, message: "Settings are unavailable." },
        };
      }
      const scope = args.scope;
      if (
        typeof scope !== "string" ||
        !["filters", "sort", "filters_and_sort", "view", "all_view"].includes(
          scope,
        )
      ) {
        return {
          name: "reset_view_settings",
          result: {
            success: false,
            error:
              "scope must be filters, sort, filters_and_sort, view, or all_view",
          },
        };
      }

      let next: AppSettings = { ...current };
      const changed: string[] = [];

      if (
        scope === "filters" ||
        scope === "filters_and_sort" ||
        scope === "all_view"
      ) {
        next = { ...next, filters: DEFAULT_FILTERS };
        changed.push("filters");
      }
      if (
        scope === "sort" ||
        scope === "filters_and_sort" ||
        scope === "all_view"
      ) {
        next = { ...next, sort: DEFAULT_SORT };
        changed.push("sort");
      }
      if (scope === "view" || scope === "all_view") {
        next = {
          ...next,
          theme: "light",
          dateFormat: "MMM d",
          showCompleted: true,
          showProgressBar: true,
          soundEnabled: false,
          fontSize: "base",
          useRelativeDates: true,
          groupingStrategy: ["dueAt"],
          defaultFocusMode: false,
          defaultCategory: "General",
          settingButtonOnInputBar: undefined,
          tagsFilterOnInputBar: undefined,
          categoriesFilterOnInputBar: undefined,
          priorityFilterOnInputBar: undefined,
          statusFilterOnInputBar: undefined,
          sortOnInputBar: undefined,
        };
        changed.push("view");
      }

      return {
        name: "reset_view_settings",
        result: await applySettings(ctx, next, changed, "Reset view settings?"),
      };
    },
  };
}
