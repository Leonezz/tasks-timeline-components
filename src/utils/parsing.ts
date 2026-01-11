import { DateTime } from "luxon";
import type { Priority, Task } from "../types";

export const parseTaskString = (input: string): Partial<Task> => {
  let title = input;
  const result: Partial<Task> = { tags: [] },

   priorityRegex = /\b(p|priority):(low|medium|high)\b/i,
   pMatch = title.match(priorityRegex);
  if (pMatch) {
    result.priority = pMatch[2].toLowerCase() as Priority;
    title = title.replace(pMatch[0], "");
  }

  const dueRegex = /\bdue:(\S+)\b/i,
   dueMatch = title.match(dueRegex);
  if (dueMatch) {
    const val = dueMatch[1].toLowerCase();
    let dateVal = "";
    if (val === "today") {dateVal = DateTime.now().toISODate() || "";}
    else if (val === "tomorrow")
      {dateVal = DateTime.now().plus({ days: 1 }).toISODate() || "";}
    else if (DateTime.fromISO(val).isValid)
      {dateVal = DateTime.fromISO(val).toISODate() || "";}
    if (dateVal) {result.dueAt = dateVal;}
    title = title.replace(dueMatch[0], "");
  }

  const tagRegex = /#(\w+)/g,
   tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(title)) !== null) {
    tags.push(match[1]);
  }
  if (tags.length > 0) {
    result.tags = tags.map((t) => ({ id: `new-${t}`, name: t }));
    title = title.replace(tagRegex, "");
  }

  const catRegex = /\b(cat|category):(\w+)\b/i,
   catMatch = title.match(catRegex);
  if (catMatch) {
    result.category = catMatch[2];
    title = title.replace(catMatch[0], "");
  }

  result.title = title.trim().replace(/\s+/g, " ");
  return result;
};
