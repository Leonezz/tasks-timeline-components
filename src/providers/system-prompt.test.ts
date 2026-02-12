import { describe, it, expect } from "vitest";
import { getSystemPrompt } from "./system-prompt";

describe("getSystemPrompt", () => {
  it("returns base prompt when no additional prompts provided", () => {
    const result = getSystemPrompt();
    expect(result).toContain("You are a task management assistant");
    expect(result).not.toContain("## Host Application Context");
    expect(result).not.toContain("## User Instructions");
  });

  it("appends developer prompt as Host Application Context", () => {
    const result = getSystemPrompt("This is an Obsidian plugin");
    expect(result).toContain("## Host Application Context");
    expect(result).toContain("This is an Obsidian plugin");
    expect(result).not.toContain("## User Instructions");
  });

  it("appends user prompt as User Instructions", () => {
    const result = getSystemPrompt(undefined, "Always respond in Spanish");
    expect(result).not.toContain("## Host Application Context");
    expect(result).toContain("## User Instructions");
    expect(result).toContain("Always respond in Spanish");
  });

  it("appends both developer and user prompts in correct order", () => {
    const result = getSystemPrompt("Running in VS Code extension", "Be brief");
    expect(result).toContain("## Host Application Context");
    expect(result).toContain("Running in VS Code extension");
    expect(result).toContain("## User Instructions");
    expect(result).toContain("Be brief");

    const devIndex = result.indexOf("## Host Application Context");
    const userIndex = result.indexOf("## User Instructions");
    expect(devIndex).toBeLessThan(userIndex);
  });

  it("skips empty string developer prompt", () => {
    const result = getSystemPrompt("", "User note");
    expect(result).not.toContain("## Host Application Context");
    expect(result).toContain("## User Instructions");
  });

  it("skips empty string user prompt", () => {
    const result = getSystemPrompt("Dev context", "");
    expect(result).toContain("## Host Application Context");
    expect(result).not.toContain("## User Instructions");
  });
});
