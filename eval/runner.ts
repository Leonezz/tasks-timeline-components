import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import type { Capabilities } from "../src/capabilities/types";
import type { IAIProvider, ChatMessage, ToolResult } from "../src/providers/types";
import type {
  EvalCase,
  Recording,
  RecordingTurn,
  EvalResult,
  CaseResult,
} from "./types";
import { createCapabilities } from "../src/capabilities/registry";
import { createProvider } from "../src/providers/index";
import { getActiveProviders } from "./config";
import { createMockContext } from "./context";
import { evaluateCase } from "./evaluator";
import { saveRecording, loadRecordingsFromDir, getLatestRecordingDir } from "./recorder";
import { printConsoleReport, saveJsonReport } from "./reporter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RECORDINGS_DIR = path.resolve(__dirname, "recordings");
const RESULTS_DIR = path.resolve(__dirname, "results");
const DEFAULT_DATASET = path.resolve(__dirname, "datasets/core.json");

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

interface CliArgs {
  all: boolean;
  provider?: string;
  filter?: string;
  replay: boolean | string;
  dataset: string;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const args: CliArgs = {
    all: false,
    replay: false,
    dataset: DEFAULT_DATASET,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--all") {
      args.all = true;
    } else if (arg.startsWith("--provider=")) {
      args.provider = arg.split("=")[1];
    } else if (arg === "--provider" && i + 1 < argv.length) {
      args.provider = argv[++i];
    } else if (arg.startsWith("--filter=")) {
      args.filter = arg.split("=")[1];
    } else if (arg === "--filter" && i + 1 < argv.length) {
      args.filter = argv[++i];
    } else if (arg === "--replay") {
      // Check if the next argument is a path (not another flag)
      if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        args.replay = argv[++i];
      } else {
        args.replay = true;
      }
    } else if (arg.startsWith("--replay=")) {
      args.replay = arg.split("=").slice(1).join("=");
    } else if (arg.startsWith("--dataset=")) {
      args.dataset = arg.split("=").slice(1).join("=");
    } else if (arg === "--dataset" && i + 1 < argv.length) {
      args.dataset = argv[++i];
    }
  }

  return args;
}

// ---------------------------------------------------------------------------
// Dataset loading
// ---------------------------------------------------------------------------

function loadDataset(filePath: string): EvalCase[] {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`Dataset not found: ${absPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(absPath, "utf-8");
  return JSON.parse(content) as EvalCase[];
}

// ---------------------------------------------------------------------------
// Single case runner — mirrors useAIAgent tool loop
// ---------------------------------------------------------------------------

async function runCase(
  testCase: EvalCase,
  capabilities: Capabilities,
  provider: IAIProvider,
  providerName: string,
  modelName: string,
): Promise<Recording> {
  const systemPrompt = capabilities.getSystemPrompt();
  const tools = capabilities.tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.schema,
  }));

  const turns: RecordingTurn[] = [];
  const startTime = Date.now();

  // Build conversation history the same way useAIAgent does
  const history: ChatMessage[] = [{ role: "user", content: testCase.input }];

  // Initial call
  const turnStart = Date.now();
  let response = await provider.chat(systemPrompt, testCase.input, tools);

  turns.push({
    role: "assistant",
    text: response.text,
    toolCalls: response.toolCalls?.map((c) => ({ name: c.name, args: c.args })),
    tokenUsage: response.tokenUsage ?? undefined,
    latencyMs: Date.now() - turnStart,
  });

  // Tool call loop (max 5 iterations, same as useAIAgent)
  let loopCount = 0;
  const maxLoops = 5;

  while (
    response.toolCalls &&
    response.toolCalls.length > 0 &&
    loopCount < maxLoops
  ) {
    loopCount++;

    // Record assistant response with tool calls in history
    history.push({
      role: "assistant",
      content: response.text,
      toolCalls: response.toolCalls,
    });

    // Execute tool calls
    const toolResults: ToolResult[] = [];
    const recordedToolResults: Array<{ name: string; result: unknown }> = [];

    for (const call of response.toolCalls) {
      if (!call.name) continue;
      const result = await capabilities.executeTool(call.name, call.args);
      toolResults.push({
        id: call.id,
        name: call.name,
        result: result.result,
      });
      recordedToolResults.push({
        name: call.name,
        result: result.result,
      });
    }

    // Record tool results turn
    turns.push({
      role: "tool",
      toolResults: recordedToolResults,
    });

    // Record tool results in history
    history.push({
      role: "tool",
      toolResults,
    });

    // Follow-up call with tool results and accumulated history
    const followUpStart = Date.now();
    response = await provider.chat(
      systemPrompt,
      testCase.input,
      tools,
      toolResults,
      history,
    );

    turns.push({
      role: "assistant",
      text: response.text,
      toolCalls: response.toolCalls?.map((c) => ({ name: c.name, args: c.args })),
      tokenUsage: response.tokenUsage ?? undefined,
      latencyMs: Date.now() - followUpStart,
    });
  }

  const totalLatencyMs = Date.now() - startTime;

  // Aggregate token usage across all turns
  const totalTokenUsage = turns.reduce(
    (acc, t) => {
      if (t.tokenUsage) {
        return {
          inputTokens: acc.inputTokens + t.tokenUsage.inputTokens,
          outputTokens: acc.outputTokens + t.tokenUsage.outputTokens,
          totalTokens: acc.totalTokens + t.tokenUsage.totalTokens,
        };
      }
      return acc;
    },
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );

  return {
    caseId: testCase.id,
    input: testCase.input,
    provider: providerName,
    model: modelName,
    timestamp: new Date().toISOString(),
    turns,
    finalTasks: [], // Populated by caller from mock context
    totalTokenUsage,
    totalLatencyMs,
  };
}

// ---------------------------------------------------------------------------
// Replay mode
// ---------------------------------------------------------------------------

function runReplay(replayPath: string | true, dataset: EvalCase[]): void {
  const replayDir =
    typeof replayPath === "string"
      ? replayPath
      : getLatestRecordingDir(RECORDINGS_DIR);

  if (!replayDir) {
    console.error("No recordings found for replay");
    process.exit(1);
  }

  console.log(`Replaying recordings from: ${replayDir}\n`);

  const recordings = loadRecordingsFromDir(replayDir);
  if (recordings.length === 0) {
    console.error("No recordings found in directory");
    process.exit(1);
  }

  // Build a lookup of test cases by id for expectedTools
  const caseMap = new Map(dataset.map((c) => [c.id, c]));

  // Group recordings by provider:model
  const grouped = new Map<string, Recording[]>();
  for (const rec of recordings) {
    const key = `${rec.provider}:${rec.model}`;
    const existing = grouped.get(key) ?? [];
    grouped.set(key, [...existing, rec]);
  }

  const allResults: EvalResult[] = [];

  for (const [key, recs] of grouped) {
    const [providerName, modelName] = key.split(":");
    const caseResults: CaseResult[] = [];

    for (const recording of recs) {
      const testCase = caseMap.get(recording.caseId);
      if (!testCase) {
        console.warn(`  Skipping recording ${recording.caseId}: no matching test case in dataset`);
        continue;
      }

      const result = evaluateCase(recording, testCase.expectedTools);
      caseResults.push(result);
    }

    const totalTokenUsage = caseResults.reduce(
      (acc, r) => ({
        inputTokens: acc.inputTokens + r.tokenUsage.inputTokens,
        outputTokens: acc.outputTokens + r.tokenUsage.outputTokens,
        totalTokens: acc.totalTokens + r.tokenUsage.totalTokens,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    );

    allResults.push({
      provider: providerName,
      model: modelName,
      cases: caseResults,
      totalPassed: caseResults.filter((r) => r.pass).length,
      totalFailed: caseResults.filter((r) => !r.pass).length,
      totalTokenUsage,
      totalLatencyMs: caseResults.reduce((acc, r) => acc + r.latencyMs, 0),
    });
  }

  printConsoleReport(allResults);
  const reportPath = saveJsonReport(allResults, RESULTS_DIR);
  console.log(`Detailed report saved to: ${reportPath}`);
}

// ---------------------------------------------------------------------------
// Live mode
// ---------------------------------------------------------------------------

async function runLive(args: CliArgs): Promise<void> {
  const providers = getActiveProviders({
    all: args.all,
    provider: args.provider,
  });

  if (providers.length === 0) {
    console.error("No providers configured (check API key environment variables)");
    process.exit(1);
  }

  const dataset = loadDataset(args.dataset);
  const cases = args.filter
    ? dataset.filter((c) => c.id.includes(args.filter!))
    : dataset;

  if (cases.length === 0) {
    console.error("No test cases match the filter");
    process.exit(1);
  }

  console.log(
    `Running ${cases.length} case(s) against ${providers.length} provider(s)...\n`,
  );

  const allResults: EvalResult[] = [];

  for (const provConfig of providers) {
    const apiKey = process.env[provConfig.apiKeyEnv]!;
    const config = {
      apiKey,
      model: provConfig.model,
      baseUrl: provConfig.baseUrl || "",
    };
    const provider = await createProvider(provConfig.provider, config);

    console.log(`Provider: ${provConfig.provider}:${provConfig.model}`);

    const caseResults: CaseResult[] = [];

    for (const testCase of cases) {
      const mockCtx = createMockContext(testCase.seedTasks);
      const capabilities = createCapabilities(mockCtx.ctx);

      process.stdout.write(
        `  Running: ${testCase.id} ...`,
      );

      try {
        const recording = await runCase(
          testCase,
          capabilities,
          provider,
          provConfig.provider,
          provConfig.model,
        );

        // Populate finalTasks from mock context state
        recording.finalTasks = mockCtx.getState().tasks;

        // Save recording
        saveRecording(recording, RECORDINGS_DIR);

        // Evaluate
        const result = evaluateCase(recording, testCase.expectedTools);
        caseResults.push(result);

        console.log(result.pass ? " PASS" : " FAIL");
        if (!result.pass) {
          for (const err of result.errors) {
            console.log(`    - ${err}`);
          }
        }
      } catch (error) {
        console.log(` ERROR: ${error}`);
        caseResults.push({
          caseId: testCase.id,
          description: testCase.description,
          provider: provConfig.provider,
          model: provConfig.model,
          pass: false,
          errors: [
            `Runtime error: ${error instanceof Error ? error.message : String(error)}`,
          ],
          actualToolCalls: [],
          expectedTools: testCase.expectedTools,
          tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          latencyMs: 0,
        });
      }
    }

    const totalTokenUsage = caseResults.reduce(
      (acc, r) => ({
        inputTokens: acc.inputTokens + r.tokenUsage.inputTokens,
        outputTokens: acc.outputTokens + r.tokenUsage.outputTokens,
        totalTokens: acc.totalTokens + r.tokenUsage.totalTokens,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    );

    allResults.push({
      provider: provConfig.provider,
      model: provConfig.model,
      cases: caseResults,
      totalPassed: caseResults.filter((r) => r.pass).length,
      totalFailed: caseResults.filter((r) => !r.pass).length,
      totalTokenUsage,
      totalLatencyMs: caseResults.reduce((acc, r) => acc + r.latencyMs, 0),
    });

    console.log("");
  }

  printConsoleReport(allResults);
  const reportPath = saveJsonReport(allResults, RESULTS_DIR);
  console.log(`Detailed report saved to: ${reportPath}`);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.replay) {
    const dataset = loadDataset(args.dataset);
    runReplay(args.replay, dataset);
  } else {
    await runLive(args);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
