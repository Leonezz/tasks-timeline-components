import { describe, expect, it } from "vitest";
import { parseVerticalMargins } from "./useLazyRender";

describe("parseVerticalMargins", () => {
  it.each([
    ["500px 0px", { top: 500, bottom: 500 }],
    ["100px", { top: 100, bottom: 100 }],
    ["10px 0px 20px", { top: 10, bottom: 20 }],
    ["10px 5px 30px 5px", { top: 10, bottom: 30 }],
    ["50% 0px", { top: 400, bottom: 400 }],
    ["-20px 0px", { top: -20, bottom: -20 }],
  ])("reads %j", (rootMargin, expected) => {
    expect(parseVerticalMargins(rootMargin, 800)).toEqual(expected);
  });

  it.each(["", "1em", "10px 10px 10px 10px 10px", "auto"])(
    "rejects %j",
    (rootMargin) => {
      expect(() => parseVerticalMargins(rootMargin, 800)).toThrow(
        /useLazyRender: rootMargin/,
      );
    },
  );
});
