import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { TokenUsageRecord } from "../src/types";
import type { EvalResult } from "./types";

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

export function formatTokens(usage: TokenUsageRecord): string {
  return `${usage.inputTokens}/${usage.outputTokens}/${usage.totalTokens}`;
}

export function printConsoleReport(results: EvalResult[]): void {
  console.log("");
  console.log(`${BOLD}=== Evaluation Results ===${RESET}`);
  console.log("");

  let grandTotalPassed = 0;
  let grandTotalCases = 0;
  const grandTotalTokens: TokenUsageRecord = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
  let grandTotalLatencyMs = 0;

  for (const result of results) {
    const totalCases = result.cases.length;
    grandTotalPassed += result.totalPassed;
    grandTotalCases += totalCases;
    grandTotalTokens.inputTokens += result.totalTokenUsage.inputTokens;
    grandTotalTokens.outputTokens += result.totalTokenUsage.outputTokens;
    grandTotalTokens.totalTokens += result.totalTokenUsage.totalTokens;
    grandTotalLatencyMs += result.totalLatencyMs;

    console.log(
      `${BOLD}${result.provider}:${result.model}${RESET}  ${DIM}(${result.totalPassed}/${totalCases} passed)${RESET}`,
    );
    console.log("");

    // Column widths
    const colCase = 20;
    const colDesc = 40;
    const colStatus = 8;
    const colTokens = 20;
    const colLatency = 10;

    // Header
    const header = [
      "Case ID".padEnd(colCase),
      "Description".padEnd(colDesc),
      "Status".padEnd(colStatus),
      "Tokens".padEnd(colTokens),
      "Latency".padEnd(colLatency),
    ].join("  ");
    console.log(`  ${DIM}${header}${RESET}`);
    console.log(`  ${DIM}${"─".repeat(header.length)}${RESET}`);

    for (const c of result.cases) {
      const statusColor = c.pass ? GREEN : RED;
      const statusText = c.pass ? "PASS" : "FAIL";

      const row = [
        c.caseId.padEnd(colCase),
        truncate(c.description, colDesc).padEnd(colDesc),
        `${statusColor}${statusText}${RESET}` +
          " ".repeat(colStatus - statusText.length),
        formatTokens(c.tokenUsage).padEnd(colTokens),
        formatLatency(c.latencyMs).padEnd(colLatency),
      ].join("  ");
      console.log(`  ${row}`);

      if (!c.pass && c.errors.length > 0) {
        for (const err of c.errors) {
          console.log(`    ${RED}└ ${err}${RESET}`);
        }
      }
    }

    console.log("");
  }

  // Summary
  const modelsCount = results.length;
  console.log(
    `${BOLD}Summary:${RESET} ${grandTotalPassed}/${grandTotalCases} passed across ${modelsCount} model${modelsCount !== 1 ? "s" : ""}`,
  );
  console.log(
    `${DIM}Total tokens: ${formatTokens(grandTotalTokens)}  |  Total latency: ${formatLatency(grandTotalLatencyMs)}${RESET}`,
  );
  console.log("");
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

export function saveJsonReport(results: EvalResult[], baseDir: string): string {
  let totalCases = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const totalTokenUsage: TokenUsageRecord = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
  let totalLatencyMs = 0;

  for (const result of results) {
    totalCases += result.cases.length;
    totalPassed += result.totalPassed;
    totalFailed += result.totalFailed;
    totalTokenUsage.inputTokens += result.totalTokenUsage.inputTokens;
    totalTokenUsage.outputTokens += result.totalTokenUsage.outputTokens;
    totalTokenUsage.totalTokens += result.totalTokenUsage.totalTokens;
    totalLatencyMs += result.totalLatencyMs;
  }

  const passRate = totalCases > 0 ? totalPassed / totalCases : 0;
  const timestamp = new Date().toISOString();

  const report = {
    timestamp,
    summary: {
      totalCases,
      totalPassed,
      totalFailed,
      passRate,
      totalTokenUsage,
      totalLatencyMs,
    },
    results,
  };

  mkdirSync(baseDir, { recursive: true });

  // Use a filesystem-safe timestamp: replace colons with hyphens
  const safeTimestamp = timestamp.replace(/:/g, "-");
  const filename = `${safeTimestamp}.json`;
  const filePath = join(baseDir, filename);

  writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");

  return filePath;
}
