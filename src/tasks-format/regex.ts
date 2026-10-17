/**
 * Regular expressions for the Obsidian Tasks plugin format.
 *
 * Pure module: no React, no DOM.
 */
import { TasksPrioritySymbolToLabel } from "./symbols";

/** The value after 🔁 (see `TaskRegularExpressions.recurrenceRegex`). */
export const RECURRENCE_VALUE =
  "(?:RRULE:|DTSTART|[A-Z]+=)[A-Za-z0-9=;:,+\\-/]+|[a-zA-Z0-9, !]*?\\buntil\\s+(?:\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}\\/\\d{1,2}\\/\\d{4}|\\d{4}\\/\\d{1,2}\\/\\d{1,2})(?:\\s+when done)?|[a-zA-Z0-9, !]+";
/** One Obsidian Tasks 🆔 id. */
export const TASK_ID = "[a-zA-Z0-9_-]+";
/** Obsidian Tasks ⛔ ids: one or more, comma separated. */
export const TASK_ID_SEQUENCE = `${TASK_ID}(?: *, *${TASK_ID})*`;

export class TaskRegularExpressions {
  public static readonly dateFormat = "yyyy-MM-dd";

  // Matches indentation before a list marker (including > for potentially nested blockquotes or Obsidian callouts)
  public static readonly indentationRegex = /^([\s\t>]*)/;

  // Matches - or * list markers, or numbered list markers (eg 1.)
  public static readonly listMarkerRegex = /([-*]|[0-9]+\.)/;

  // Matches a checkbox and saves the status character inside
  public static readonly checkboxRegex = /\[(.)\]/u;

  // Matches the rest of the task after the checkbox.
  public static readonly afterCheckboxRegex = / *(.*)/u;

  // Main regex for parsing a line. It matches the following:
  // - Indentation
  // - List marker
  // - Status character
  // - Rest of task after checkbox markdown
  public static readonly taskRegex = new RegExp(
    TaskRegularExpressions.indentationRegex.source +
      TaskRegularExpressions.listMarkerRegex.source +
      " +" +
      TaskRegularExpressions.checkboxRegex.source +
      TaskRegularExpressions.afterCheckboxRegex.source,
    "u",
  );

  // Used with the "Create or Edit Task" command to parse indentation and status if present
  public static readonly nonTaskRegex = new RegExp(
    TaskRegularExpressions.indentationRegex.source +
      TaskRegularExpressions.listMarkerRegex.source +
      "? *(" +
      TaskRegularExpressions.checkboxRegex.source +
      ")?" +
      TaskRegularExpressions.afterCheckboxRegex.source,
    "u",
  );

  // Used with "Toggle Done" command to detect a list item that can get a checkbox added to it.
  public static readonly listItemRegex = new RegExp(
    TaskRegularExpressions.indentationRegex.source +
      TaskRegularExpressions.listMarkerRegex.source,
  );

  // Match on block link at end (as Obsidian Tasks does: a block id elsewhere
  // in the line is text).
  public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+$/u;

  // The following regex's end with `$` because they will be matched and
  // removed from the end until none are left.
  public static readonly priorityRegex = RegExp(
    "([" +
      Object.keys(TasksPrioritySymbolToLabel)
        .filter((s) => s.length > 0)
        .join("") +
      "])$",
    "u",
  );

  public static readonly startDateRegex = /🛫 *(\d{4}-\d{2}-\d{2})/u;
  public static readonly createDateRegex = /➕ *(\d{4}-\d{2}-\d{2})/u;
  public static readonly scheduledDateRegex = /[⏳⌛] *(\d{4}-\d{2}-\d{2})/u;
  public static readonly dueDateRegex = /[📅📆🗓] *(\d{4}-\d{2}-\d{2})/u;
  public static readonly doneDateRegex = /✅ *(\d{4}-\d{2}-\d{2})/u;
  public static readonly cancelledDateRegex = /❌ *(\d{4}-\d{2}-\d{2})/u;
  /**
   * The recurrence after 🔁 (optionally followed by U+FE0F, as Obsidian Tasks
   * allows): a text rule in the characters Tasks reads ([a-zA-Z0-9, !]), so
   * the next field (🏁, ❌, 🆔, a [[link]], #tag) is never taken into it. Two
   * shapes earlier versions wrote are also read whole, so they can be
   * repaired on the next save: RRULE syntax ("RRULE:FREQ=WEEKLY;BYDAY=MO",
   * "FREQ=DAILY") and text with a numeric end date ("every month until
   * 2026-12-31").
   */
  public static readonly recurrenceRegex = new RegExp(
    `🔁\\uFE0F? *(${RECURRENCE_VALUE})`,
    "u",
  );
  /** Obsidian Tasks 🏁 on-completion action ("keep", "delete"). */
  public static readonly onCompletionRegex = /🏁\uFE0F? *([a-zA-Z]+)/u;
  /** Obsidian Tasks 🆔 task id. */
  public static readonly idRegex = new RegExp(`🆔\\uFE0F? *(${TASK_ID})`, "u");
  /** Obsidian Tasks ⛔ ids of the tasks this one depends on, comma separated. */
  public static readonly dependsOnRegex = new RegExp(
    `⛔\\uFE0F? *(${TASK_ID_SEQUENCE})`,
    "u",
  );

  // regex from @702573N
  public static readonly hexColorRegex =
    /([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\/(.*)/;
  public static readonly TasksPluginDateRegex =
    /[🛫|⏳|📅|✅] *(\d{4}-\d{2}-\d{2})/u;

  // [[a::b]] or [[a:: b]] => a, b (space after :: is optional)
  public static readonly keyValueRegex = /\[+([^\]]+):: ?([^\]]+)\]\]/g;

  /**
   * [a](b) => a, b (a could be empty)
   * #1: [a](b)
   * #2: a
   * #3: b
   */
  public static readonly outerLinkRegex =
    /\[((?:\[[^\]]*\]|[^[\]])*)\]\([ \t]*<?((?:\([^)]*\)|[^()\s])*?)>?[ \t]*((['"])(.*?)\5[ \t]*)?\)/g;

  public static readonly innerLinkRegex = /\[\[([^\]]+)\]\]/g;
  public static readonly highlightRegex = /==([^\]]+)==/g;
  public static readonly remainderRegex =
    /⏰ *(\d{4}-\d{2}-\d{2}) *(\d{2}:\d{2})|⏰ *(\d{4}-\d{2}-\d{2})|(\(@(\d{4}-\d{2}-\d{2}) *(\d{2}:\d{2})\))|(\(@(\d{4}-\d{2}-\d{2})\))/;
  // Regex to match all hash tags, basically hash followed by anything but the characters in the negation.
  // To ensure URLs are not caught it is looking of beginning of string tag and any
  // tag that has a space in front of it. Any # that has a character in front
  // of it will be ignored.
  // EXAMPLE:
  // description: '#dog #car http://www/ddd#ere #house'
  // matches: #dog, #car, #house
  public static readonly hashTags = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]*/g;
  public static readonly hashTagsFromEnd = new RegExp(
    this.hashTags.source + "$",
  );
}
