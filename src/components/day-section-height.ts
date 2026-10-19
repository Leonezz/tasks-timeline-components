import { ESTIMATED_ITEM_HEIGHT } from "../hooks/useLazyRender";
import type { DayGroup } from "../types";

/**
 * A day section's height (px) while its rows are placeholders, without
 * them: header, add-task row and spacing, at the default font size.
 */
export const DAY_SECTION_BASE_HEIGHT = 116;
/** A collapsed day section's height (px): its header and spacing. */
export const DAY_SECTION_COLLAPSED_HEIGHT = 58;

/** Estimated height of a day section that has not been measured (px). */
export const estimateDaySectionHeight = (group: DayGroup, open: boolean) =>
  open
    ? DAY_SECTION_BASE_HEIGHT + group.tasks.length * ESTIMATED_ITEM_HEIGHT
    : DAY_SECTION_COLLAPSED_HEIGHT;
