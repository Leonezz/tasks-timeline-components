/**
 * Safe date helper utilities
 *
 * This module provides timezone-safe date operations to prevent common bugs.
 * All functions use Luxon's DateTime for consistent timezone handling.
 *
 * @module date-helpers
 */

import { DateTime } from "luxon";

/**
 * Get the current local date in ISO format (YYYY-MM-DD)
 *
 * Use this instead of: new Date().toISOString().split("T")[0]
 * which returns UTC date and can differ from user's local date.
 *
 * @returns {string} ISO date string (YYYY-MM-DD) in local timezone
 * @example
 * const today = getTodayISO(); // "2026-01-31"
 */
export const getTodayISO = (): string => {
  return DateTime.now().toISODate() || "";
};

/**
 * Get the current date and time as full ISO timestamp
 *
 * Use this for datetime fields like createdAt, completedAt.
 *
 * @returns {string} Full ISO timestamp with timezone
 * @example
 * const now = getNowISO(); // "2026-01-31T10:30:00.000-08:00"
 */
export const getNowISO = (): string => {
  return DateTime.now().toISO() || "";
};

/**
 * Get tomorrow's date in ISO format (YYYY-MM-DD)
 *
 * @returns {string} ISO date string for tomorrow
 * @example
 * const tomorrow = getTomorrowISO(); // "2026-02-01"
 */
export const getTomorrowISO = (): string => {
  return DateTime.now().plus({ days: 1 }).toISODate() || "";
};

/**
 * Get yesterday's date in ISO format (YYYY-MM-DD)
 *
 * @returns {string} ISO date string for yesterday
 * @example
 * const yesterday = getYesterdayISO(); // "2026-01-30"
 */
export const getYesterdayISO = (): string => {
  return DateTime.now().minus({ days: 1 }).toISODate() || "";
};

/**
 * Convert a Date object to ISO date string (YYYY-MM-DD) in local timezone
 *
 * Use this when working with native Date objects from libraries like date-fns.
 * Ensures timezone-safe conversion without shifting dates.
 *
 * @param {Date} date - Native JavaScript Date object
 * @returns {string} ISO date string (YYYY-MM-DD)
 * @example
 * const jsDate = new Date(2026, 1, 5); // Feb 5, 2026
 * const isoDate = dateToISODate(jsDate); // "2026-02-05"
 */
export const dateToISODate = (date: Date): string => {
  return DateTime.fromJSDate(date).toISODate() || "";
};

/**
 * Convert a Date object to full ISO timestamp in local timezone
 *
 * @param {Date} date - Native JavaScript Date object
 * @returns {string} Full ISO timestamp
 * @example
 * const jsDate = new Date(2026, 1, 5, 14, 30);
 * const iso = dateToISO(jsDate); // "2026-02-05T14:30:00.000-08:00"
 */
export const dateToISO = (date: Date): string => {
  return DateTime.fromJSDate(date).toISO() || "";
};

/**
 * Get a date N days from now in ISO format (YYYY-MM-DD)
 *
 * @param {number} days - Number of days (positive for future, negative for past)
 * @returns {string} ISO date string
 * @example
 * const nextWeek = getDaysFromNowISO(7); // "2026-02-07"
 * const lastWeek = getDaysFromNowISO(-7); // "2026-01-24"
 */
export const getDaysFromNowISO = (days: number): string => {
  return DateTime.now().plus({ days }).toISODate() || "";
};

/**
 * Check if two ISO date strings represent the same day
 *
 * @param {string} date1 - First ISO date string
 * @param {string} date2 - Second ISO date string
 * @returns {boolean} True if both dates are the same day
 * @example
 * isSameDay("2026-01-31", "2026-01-31T14:30:00Z"); // true
 * isSameDay("2026-01-31", "2026-02-01"); // false
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  const dt1 = DateTime.fromISO(date1);
  const dt2 = DateTime.fromISO(date2);
  if (!dt1.isValid || !dt2.isValid) return false;
  return dt1.hasSame(dt2, "day");
};

/**
 * Check if a date is today
 *
 * @param {string} dateStr - ISO date string to check
 * @returns {boolean} True if the date is today
 * @example
 * isToday("2026-01-31"); // true (if today is Jan 31)
 */
export const isToday = (dateStr: string): boolean => {
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) return false;
  return dt.hasSame(DateTime.now(), "day");
};

/**
 * Generate a unique ID with timestamp
 *
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID string
 * @example
 * const id = generateTimestampId("task"); // "task-1706745600000-abc"
 */
export const generateTimestampId = (prefix = ""): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};
