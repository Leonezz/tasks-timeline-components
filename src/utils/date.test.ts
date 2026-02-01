import { describe, it, expect } from "vitest";
import { formatSmartDate } from "./date";

describe("formatSmartDate", () => {
  // Note: Tests use real dates relative to Feb 1, 2026 (current date)
  // to avoid mocking DateTime.now() which is difficult with Luxon

  describe("urgency-based relative dates (bug fix for issue #14)", () => {
    it("shows 'in 2 days' for Feb 3 (within 5-day threshold)", () => {
      const result = formatSmartDate("2026-02-03", true, "yyyy-MM-dd");
      expect(result).toBe("in 2 days");
    });

    it("shows 'in 5 days' for Feb 6 (at 5-day threshold)", () => {
      const result = formatSmartDate("2026-02-06", true, "yyyy-MM-dd");
      expect(result).toBe("in 5 days");
    });

    it("shows 'in 4 days' for Feb 5 (within 5-day threshold)", () => {
      const result = formatSmartDate("2026-02-05", true, "yyyy-MM-dd");
      expect(result).toBe("in 4 days");
    });

    it("lets Luxon choose unit for dates beyond 5 days (e.g., weeks/months)", () => {
      const result = formatSmartDate("2026-03-03", true, "yyyy-MM-dd"); // 30 days
      // Beyond 5 days, Luxon chooses appropriate unit (months for ~30 days)
      expect(result).toBe("in 1 month");
    });

    it("lets Luxon choose unit for dates ~2 weeks away", () => {
      const result = formatSmartDate("2026-02-15", true, "yyyy-MM-dd"); // 14 days
      // Luxon returns "in 14 days" for this range (not "in 2 weeks")
      expect(result).toBe("in 14 days");
    });
  });

  describe("existing behavior (should still work)", () => {
    it("returns 'Today' for today's date", () => {
      const result = formatSmartDate("2026-02-01", true, "yyyy-MM-dd");
      expect(result).toBe("Today");
    });

    it("returns 'Tomorrow' for tomorrow", () => {
      const result = formatSmartDate("2026-02-02", true, "yyyy-MM-dd");
      expect(result).toBe("Tomorrow");
    });

    it("returns 'Yesterday' for yesterday", () => {
      const result = formatSmartDate("2026-01-31", true, "yyyy-MM-dd");
      expect(result).toBe("Yesterday");
    });

    it("returns absolute date when useRelative is false", () => {
      const result = formatSmartDate("2026-02-15", false, "yyyy-MM-dd");
      expect(result).toBe("2026-02-15");
    });

    it("handles dates far in the future (Luxon chooses months)", () => {
      const result = formatSmartDate("2026-04-01", true, "yyyy-MM-dd"); // ~59 days
      // Beyond 5 days, Luxon chooses appropriate unit (months for far future)
      expect(result).toBe("in 2 months");
    });

    it("handles dates in the past", () => {
      const result = formatSmartDate("2026-01-20", true, "yyyy-MM-dd"); // ~12 days ago
      expect(result).toContain("ago");
    });
  });
});
