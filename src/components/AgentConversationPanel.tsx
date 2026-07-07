import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import type { AgentEntry, AgentSession, LucideIconName } from "../types";
import { cn } from "../utils";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";
import { MarkdownText } from "./MarkdownText";

interface AgentConversationPanelProps {
  isOpen: boolean;
  sessions: AgentSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onStartNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onSendMessage: (message: string) => void | Promise<void>;
  onClose: () => void;
  onClear?: () => void;
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stringifyPayload(payload: unknown): string | null {
  if (payload === undefined || payload === null) {
    return null;
  }

  try {
    const text =
      typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    return text.length > 900 ? `${text.slice(0, 900)}...` : text;
  } catch {
    return String(payload);
  }
}

function getEntryPreview(entry: AgentEntry, payload: string | null): string {
  const bodyPreview = entry.body
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (bodyPreview) {
    return bodyPreview;
  }

  return payload ? "Payload available" : "No additional details";
}

function getEntryIcon(entry: AgentEntry): LucideIconName {
  switch (entry.kind) {
    case "user":
      return "User";
    case "assistant":
      return "Sparkles";
    case "tool-call":
      return "Wrench";
    case "tool-result":
      return "CheckCircle2";
    case "error":
      return "AlertCircle";
    case "status":
      return "Activity";
  }
}

function getStatusStyles(status: AgentSession["status"]): string {
  switch (status) {
    case "running":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    case "complete":
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    case "error":
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  }
}

function getEntryKindLabel(entry: AgentEntry): string {
  switch (entry.kind) {
    case "user":
      return "User message";
    case "assistant":
      return "Answer";
    case "tool-call":
      return "Tool call";
    case "tool-result":
      return "Tool result";
    case "error":
      return "Run stopped";
    case "status":
      return "Step update";
  }
}

function getPayloadLabel(entry: AgentEntry): string {
  switch (entry.kind) {
    case "tool-call":
      return "Tool input";
    case "tool-result":
      return "Tool output";
    case "status":
      return "Status payload";
    case "assistant":
      return "Reply payload";
    case "user":
      return "Message payload";
    case "error":
      return "Error payload";
  }
}

function getEntryCopyLabel(entry: AgentEntry): string {
  switch (entry.kind) {
    case "assistant":
      return "Copy reply";
    case "error":
      return "Copy error";
    case "tool-call":
      return "Copy tool request";
    case "tool-result":
      return "Copy tool response";
    case "status":
      return "Copy status update";
    case "user":
      return "Copy message";
  }
}

function getSessionStatusLabel(status: AgentSession["status"]): string {
  switch (status) {
    case "running":
      return "Running";
    case "complete":
      return "Complete";
    case "error":
      return "Failed";
  }
}

function getSessionTabLabel(session: AgentSession): string {
  const status = getSessionStatusLabel(session.status);
  const updatedAt = formatTime(session.updatedAt);
  const timeSuffix = updatedAt ? ` at ${updatedAt}` : "";

  return `${status}${timeSuffix}: ${session.prompt}`;
}

function getLatestProgressText(session: AgentSession): string | null {
  for (let index = session.entries.length - 1; index >= 0; index -= 1) {
    const entry = session.entries[index];
    if (!entry || !isProcessEntry(entry)) {
      continue;
    }

    if (entry.body) {
      return entry.body;
    }

    if (entry.toolName) {
      return `${getEntryKindLabel(entry)}: ${entry.toolName}`;
    }

    return entry.title;
  }

  return null;
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 3)}...`
    : value;
}

function sanitizeDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function isProcessEntry(entry: AgentEntry): boolean {
  return (
    entry.kind === "status" ||
    entry.kind === "tool-call" ||
    entry.kind === "tool-result" ||
    entry.kind === "error"
  );
}

type ProcessItemStatus = "complete" | "running" | "error";

interface ProcessSummary {
  title: string;
  detail: string;
  stepCount: number;
  toolCallCount: number;
  toolResultCount: number;
  statusCount: number;
  errorCount: number;
  progressPercent: number;
  elapsedLabel: string | null;
}

function humanizeToolName(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  if (!spaced) {
    return "tool";
  }

  return spaced.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCountLabel(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getElapsedLabel(entries: AgentEntry[]): string | null {
  const first = entries[0];
  const last = entries[entries.length - 1];

  if (!first || !last) {
    return null;
  }

  const startedAt = new Date(first.timestamp).getTime();
  const endedAt = new Date(last.timestamp).getTime();

  if (
    Number.isNaN(startedAt) ||
    Number.isNaN(endedAt) ||
    endedAt < startedAt
  ) {
    return null;
  }

  const totalSeconds = Math.max(1, Math.round((endedAt - startedAt) / 1000));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function getProcessStatus(
  entry: AgentEntry,
  index: number,
  totalEntries: number,
  isRunning: boolean,
): ProcessItemStatus {
  if (entry.kind === "error") {
    return "error";
  }

  if (isRunning && index === totalEntries - 1) {
    return "running";
  }

  return "complete";
}

function getProcessStatusIcon(status: ProcessItemStatus): LucideIconName {
  switch (status) {
    case "running":
      return "Loader2";
    case "error":
      return "AlertCircle";
    case "complete":
      return "CheckCircle2";
  }
}

function getProcessStatusStyles(status: ProcessItemStatus): string {
  switch (status) {
    case "running":
      return "border-blue-200 bg-blue-50 text-blue-600";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-600";
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-600";
  }
}

function getProcessTypeIcon(entry: AgentEntry): LucideIconName {
  switch (entry.kind) {
    case "tool-call":
      return "Wrench";
    case "tool-result":
      return "Database";
    case "error":
      return "AlertTriangle";
    case "status":
      return "Activity";
    case "assistant":
      return "Sparkles";
    case "user":
      return "User";
  }
}

function getProcessTypeLabel(entry: AgentEntry): string {
  switch (entry.kind) {
    case "tool-call":
      return "tool";
    case "tool-result":
      return "result";
    case "error":
      return "error";
    case "status":
      return "step";
    case "assistant":
      return "answer";
    case "user":
      return "user";
  }
}

function getProcessTitle(entry: AgentEntry): string {
  if (entry.kind === "tool-call" && entry.toolName) {
    return `Run ${humanizeToolName(entry.toolName)}`;
  }

  if (entry.kind === "tool-result" && entry.toolName) {
    return `${humanizeToolName(entry.toolName)} returned`;
  }

  if (entry.kind === "error") {
    return "Resolve run error";
  }

  const titleSource = entry.body || entry.title;

  if (/^connecting to provider$/i.test(titleSource)) {
    return "Connect provider";
  }

  if (/^thinking$/i.test(titleSource)) {
    return "Reason through request";
  }

  if (/^reviewing tool results$/i.test(titleSource)) {
    return "Review tool output";
  }

  if (/^agent started$/i.test(titleSource)) {
    return "Start agent run";
  }

  return truncateText(titleSource, 48);
}

function getProcessPreview(entry: AgentEntry, payload: string | null): string {
  if (entry.kind === "tool-call") {
    return payload ? "Input prepared for the capability." : "Capability queued.";
  }

  if (entry.kind === "tool-result") {
    return payload ? "Structured output is available." : "Capability finished.";
  }

  return getEntryPreview(entry, payload);
}

function getProcessSummary(
  entries: AgentEntry[],
  isRunning: boolean,
): ProcessSummary {
  const stepCount = entries.length;
  const toolCallCount = entries.filter(
    (entry) => entry.kind === "tool-call",
  ).length;
  const toolResultCount = entries.filter(
    (entry) => entry.kind === "tool-result",
  ).length;
  const statusCount = entries.filter((entry) => entry.kind === "status").length;
  const errorCount = entries.filter((entry) => entry.kind === "error").length;
  const completedCount = entries.filter(
    (entry, index) =>
      getProcessStatus(entry, index, entries.length, isRunning) === "complete",
  ).length;
  const progressPercent =
    stepCount === 0 ? 0 : Math.round((completedCount / stepCount) * 100);
  const elapsedLabel = getElapsedLabel(entries);
  const countParts = [
    formatCountLabel(stepCount, "step"),
    toolCallCount > 0 ? formatCountLabel(toolCallCount, "tool") : undefined,
    toolResultCount > 0
      ? formatCountLabel(toolResultCount, "output")
      : undefined,
    errorCount > 0 ? formatCountLabel(errorCount, "error") : undefined,
    elapsedLabel,
  ].filter(Boolean);

  return {
    title: errorCount > 0 ? "Needs attention" : isRunning ? "Working" : "Done",
    detail: countParts.join(" - "),
    stepCount,
    toolCallCount,
    toolResultCount,
    statusCount,
    errorCount,
    progressPercent,
    elapsedLabel,
  };
}

type AgentConversationDisplayItem =
  | { type: "entry"; entry: AgentEntry }
  | { type: "process"; id: string; entries: AgentEntry[] };

function groupAgentEntriesForDisplay(
  entries: AgentEntry[],
): AgentConversationDisplayItem[] {
  const items: AgentConversationDisplayItem[] = [];
  let processEntries: AgentEntry[] = [];

  entries.forEach((entry) => {
    if (isProcessEntry(entry)) {
      processEntries.push(entry);
      return;
    }

    if (processEntries.length > 0) {
      items.push({
        type: "process",
        id: `process-${processEntries[0].id}`,
        entries: processEntries,
      });
      processEntries = [];
    }

    items.push({ type: "entry", entry });
  });

  if (processEntries.length > 0) {
    items.push({
      type: "process",
      id: `process-${processEntries[0].id}`,
      entries: processEntries,
    });
  }

  return items;
}

function formatPayloadForCopy(payload: unknown): string | null {
  if (payload === undefined || payload === null) {
    return null;
  }

  try {
    return typeof payload === "string"
      ? payload
      : JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

function formatEntryForCopy(entry: AgentEntry): string {
  const parts = [
    `## ${entry.title} (${entry.kind})`,
    `Time: ${entry.timestamp}`,
  ];

  if (entry.body) {
    parts.push("", entry.body);
  }

  const payload = formatPayloadForCopy(entry.payload);
  if (payload) {
    parts.push("", "```json", payload, "```");
  }

  return parts.join("\n");
}

function formatTrajectoryForCopy(session: AgentSession): string {
  return [
    "# Agent conversation trajectory",
    `Session: ${session.id}`,
    `Status: ${session.status}`,
    `Provider: ${session.provider}`,
    `Model: ${session.model || "default model"}`,
    `Started: ${session.startedAt}`,
    `Updated: ${session.updatedAt}`,
    "",
    `Prompt: ${session.prompt}`,
    "",
    ...session.entries.map(formatEntryForCopy),
  ].join("\n\n");
}

async function copyTextToClipboard(text: string): Promise<void> {
  let clipboardError: unknown;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      clipboardError = error;
    }
  }

  if (typeof document !== "undefined" && document.body) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    try {
      if (document.execCommand("copy")) {
        return;
      }
    } finally {
      document.body.removeChild(textArea);
    }
  }

  throw clipboardError instanceof Error
    ? clipboardError
    : new Error("Clipboard is not available.");
}

type CopyStatus = "idle" | "copied" | "error";

function getCopyStatusLabel(status: CopyStatus): string {
  switch (status) {
    case "copied":
      return "Copied";
    case "error":
      return "Copy failed";
    case "idle":
      return "Copy";
  }
}

function useCopyFeedback() {
  const resetTimersRef = useRef<Map<string, number>>(new Map());
  const [copyStates, setCopyStates] = useState<Record<string, CopyStatus>>({});

  useEffect(
    () => () => {
      resetTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      resetTimersRef.current.clear();
    },
    [],
  );

  const setCopyStatus = useCallback((key: string, status: CopyStatus) => {
    const existingTimer = resetTimersRef.current.get(key);
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
    }

    setCopyStates((current) => ({ ...current, [key]: status }));

    const timerId = window.setTimeout(() => {
      setCopyStates((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      resetTimersRef.current.delete(key);
    }, 1800);

    resetTimersRef.current.set(key, timerId);
  }, []);

  const copy = useCallback(
    async (key: string, text: string | null | undefined) => {
      if (!text) {
        setCopyStatus(key, "error");
        return;
      }

      try {
        await copyTextToClipboard(text);
        setCopyStatus(key, "copied");
      } catch {
        setCopyStatus(key, "error");
      }
    },
    [setCopyStatus],
  );

  const getStatus = useCallback(
    (key: string): CopyStatus => copyStates[key] ?? "idle",
    [copyStates],
  );

  return { copy, getStatus };
}

const CopyActionButton: React.FC<{
  label: string;
  status: CopyStatus;
  onCopy: () => void;
  compact?: boolean;
}> = ({ label, status, onCopy, compact = false }) => {
  const statusLabel = getCopyStatusLabel(status);
  const accessibleLabel =
    status === "idle" ? label : `${statusLabel}: ${label}`;

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300",
        status === "copied"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600",
      )}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <Icon
        name={
          status === "copied"
            ? "Check"
            : status === "error"
              ? "AlertCircle"
              : "Copy"
        }
        size={12}
      />
      <span>{compact && status === "idle" ? label : statusLabel}</span>
    </button>
  );
};

const AgentEntryRow: React.FC<{
  entry: AgentEntry;
  copyStatus: CopyStatus;
  onCopyEntry: (entry: AgentEntry) => void;
}> = ({ entry, copyStatus, onCopyEntry }) => {
  const isUser = entry.kind === "user";
  const isAssistant = entry.kind === "assistant";

  if (isUser || isAssistant || entry.kind === "error") {
    return (
      <div
        className={cn(
          "flex gap-3 px-4 py-3",
          isUser ? "justify-end" : "justify-start",
        )}
      >
        {!isUser && (
          <div
            className={cn(
              "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1",
              entry.kind === "error"
                ? "bg-rose-50 text-rose-600 ring-rose-100"
                : isAssistant
                  ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                  : "bg-blue-50 text-blue-600 ring-blue-100",
            )}
          >
            <Icon name={getEntryIcon(entry)} size={15} />
          </div>
        )}
        <div
          className={cn(
            "min-w-0 max-w-[min(86%,640px)] rounded-lg border px-3 py-2 shadow-sm",
            isUser &&
              "border-blue-200 bg-blue-50 text-slate-800 shadow-blue-100/50",
            isAssistant &&
              "border-emerald-200 bg-white text-slate-800 shadow-emerald-100/40",
            entry.kind === "error" &&
              "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-100/40",
          )}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {getEntryKindLabel(entry)}
              </h4>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {isAssistant && (
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600 ring-1 ring-emerald-100">
                  Result
                </span>
              )}
              <span className="font-mono text-[10px] text-slate-400">
                {formatTime(entry.timestamp)}
              </span>
              <CopyActionButton
                label={getEntryCopyLabel(entry)}
                status={copyStatus}
                onCopy={() => onCopyEntry(entry)}
                compact
              />
            </div>
          </div>
          {entry.body && (
            <MarkdownText
              content={entry.body}
              className="break-words text-sm leading-relaxed text-slate-700"
              paragraphClassName="leading-relaxed"
              preClassName="my-1 max-h-72"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
};

const ProcessTimelineRow: React.FC<{
  entry: AgentEntry;
  status: ProcessItemStatus;
  isSelected: boolean;
  onSelect: (entryId: string) => void;
}> = ({ entry, status, isSelected, onSelect }) => {
  const payload = stringifyPayload(entry.payload);
  const preview = getProcessPreview(entry, payload);
  const typeLabel = getProcessTypeLabel(entry);
  const statusLabel =
    status === "running" ? "running" : status === "error" ? "error" : "done";

  return (
    <button
      type="button"
      onClick={() => onSelect(entry.id)}
      className={cn(
        "group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300",
        isSelected
          ? "border-blue-200 bg-blue-50/70"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50",
      )}
      data-testid="agent-process-entry"
      data-entry-kind={entry.kind}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          getProcessStatusStyles(status),
        )}
      >
        <Icon
          name={getProcessStatusIcon(status)}
          size={14}
          className={status === "running" ? "animate-spin" : undefined}
        />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-500">
            <Icon name={getProcessTypeIcon(entry)} size={12} />
          </span>
          <h4 className="min-w-0 truncate text-xs font-bold text-slate-700">
            {getProcessTitle(entry)}
          </h4>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              entry.kind === "tool-call" &&
                "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
              entry.kind === "tool-result" &&
                "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
              entry.kind === "status" &&
                "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
              entry.kind === "error" &&
                "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
            )}
          >
            {typeLabel}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
          {preview}
        </p>
        {entry.toolName && (
          <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
            {entry.toolName}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[10px] text-slate-400">
          {formatTime(entry.timestamp)}
        </span>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
          {statusLabel}
        </span>
      </div>
    </button>
  );
};

const ProcessInspector: React.FC<{
  entry: AgentEntry;
  copyEntryStatus: CopyStatus;
  copyPayloadStatus: CopyStatus;
  onCopyEntry: (entry: AgentEntry) => void;
  onCopyPayload: (entry: AgentEntry) => void;
}> = ({
  entry,
  copyEntryStatus,
  copyPayloadStatus,
  onCopyEntry,
  onCopyPayload,
}) => {
  const payload = stringifyPayload(entry.payload);
  const payloadLabel = getPayloadLabel(entry);
  const preview = getProcessPreview(entry, payload);

  return (
    <aside
      className="min-w-0 rounded-md border border-slate-200 bg-white p-3"
      aria-label="Selected processing step details"
      data-testid="agent-process-inspector"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Step details
          </p>
          <h4 className="mt-0.5 truncate text-sm font-black text-slate-800">
            {getProcessTitle(entry)}
          </h4>
        </div>
        <CopyActionButton
          label={getEntryCopyLabel(entry)}
          status={copyEntryStatus}
          onCopy={() => onCopyEntry(entry)}
          compact
        />
      </div>

      <dl className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md bg-slate-50 p-2">
          <dt className="font-bold uppercase tracking-wide text-slate-400">
            Type
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-700">
            {getEntryKindLabel(entry)}
          </dd>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <dt className="font-bold uppercase tracking-wide text-slate-400">
            Time
          </dt>
          <dd className="mt-0.5 font-mono text-slate-700">
            {formatTime(entry.timestamp)}
          </dd>
        </div>
        {entry.toolName && (
          <div className="col-span-2 rounded-md bg-slate-50 p-2">
            <dt className="font-bold uppercase tracking-wide text-slate-400">
              Capability
            </dt>
            <dd className="mt-0.5 truncate font-mono text-slate-700">
              {entry.toolName}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-3 rounded-md border border-slate-100 bg-slate-50/70 p-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Summary
        </p>
        {entry.body ? (
          <MarkdownText
            content={entry.body}
            className="mt-1 text-xs leading-relaxed text-slate-600"
            compact
          />
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {preview}
          </p>
        )}
      </div>

      {payload && (
        <details className="mt-3">
          <summary
            className="cursor-pointer text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700"
            data-testid="agent-payload-toggle"
          >
            {payloadLabel}
          </summary>
          <div className="mt-2 rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-1.5">
              <span className="text-[10px] font-semibold text-slate-400">
                {payloadLabel} data
              </span>
              <CopyActionButton
                label={`Copy ${payloadLabel.toLowerCase()}`}
                status={copyPayloadStatus}
                onCopy={() => onCopyPayload(entry)}
                compact
              />
            </div>
            <pre className="max-h-44 overflow-auto overscroll-contain p-2 font-mono text-[10px] leading-relaxed text-slate-600">
              {payload}
            </pre>
          </div>
        </details>
      )}
    </aside>
  );
};

const AgentProcessBlock: React.FC<{
  entries: AgentEntry[];
  isRunning: boolean;
  getCopyStatus: (key: string) => CopyStatus;
  onCopyEntry: (entry: AgentEntry) => void;
  onCopyPayload: (entry: AgentEntry) => void;
}> = ({ entries, isRunning, getCopyStatus, onCopyEntry, onCopyPayload }) => {
  const summary = useMemo(
    () => getProcessSummary(entries, isRunning),
    [entries, isRunning],
  );
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const selectedEntry = useMemo(
    () =>
      entries.find((entry) => entry.id === selectedEntryId) ??
      entries[entries.length - 1] ??
      null,
    [entries, selectedEntryId],
  );

  return (
    <div className="px-4 py-2">
      <details
        className={cn(
          "group rounded-lg border bg-white shadow-sm",
          summary.errorCount > 0
            ? "border-rose-200 shadow-rose-100/50"
            : "border-slate-200 shadow-slate-100",
        )}
        open={isRunning || summary.errorCount > 0 || undefined}
        data-testid="agent-process-block"
        data-state={isRunning ? "live" : "logged"}
      >
        <summary
          className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-300 [&::-webkit-details-marker]:hidden"
          data-testid="agent-process-block-toggle"
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
              summary.errorCount > 0
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : isRunning
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-emerald-200 bg-emerald-50 text-emerald-600",
            )}
          >
            <Icon
              name={
                summary.errorCount > 0
                  ? "AlertCircle"
                  : isRunning
                    ? "Loader2"
                    : "CheckCircle2"
              }
              size={16}
              className={isRunning ? "animate-spin" : undefined}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-xs font-bold text-slate-600">
                Agent processing
              </h4>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                {summary.title}
              </span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <div
                className="h-1.5 min-w-14 flex-1 overflow-hidden rounded-full bg-slate-100"
                aria-hidden
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    summary.errorCount > 0
                      ? "bg-rose-500"
                      : isRunning
                        ? "bg-blue-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${summary.progressPercent}%` }}
                />
              </div>
              <p className="truncate text-[11px] leading-relaxed text-slate-400">
                {summary.detail}
              </p>
            </div>
          </div>
          <Icon
            name="ChevronDown"
            size={15}
            className="shrink-0 text-slate-300 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="border-t border-slate-100 bg-slate-50/60 p-3">
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
              <Icon name="ListChecks" size={12} />
              {formatCountLabel(summary.stepCount, "step")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-600 ring-1 ring-blue-100">
              <Icon name="Wrench" size={12} />
              {formatCountLabel(summary.toolCallCount, "tool")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-100">
              <Icon name="Database" size={12} />
              {formatCountLabel(summary.toolResultCount, "output")}
            </span>
            {summary.statusCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                <Icon name="Activity" size={12} />
                {formatCountLabel(summary.statusCount, "update")}
              </span>
            )}
            {summary.errorCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-rose-600 ring-1 ring-rose-100">
                <Icon name="AlertCircle" size={12} />
                {formatCountLabel(summary.errorCount, "error")}
              </span>
            )}
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)]">
            <div className="space-y-2" role="list" aria-label="Agent steps">
              {entries.map((entry, index) => {
                const status = getProcessStatus(
                  entry,
                  index,
                  entries.length,
                  isRunning,
                );

                return (
                  <div key={entry.id} role="listitem">
                    <ProcessTimelineRow
                      entry={entry}
                      status={status}
                      isSelected={entry.id === selectedEntry?.id}
                      onSelect={setSelectedEntryId}
                    />
                  </div>
                );
              })}
            </div>
            {selectedEntry && (
              <ProcessInspector
                entry={selectedEntry}
                copyEntryStatus={getCopyStatus(`entry:${selectedEntry.id}`)}
                copyPayloadStatus={getCopyStatus(`payload:${selectedEntry.id}`)}
                onCopyEntry={onCopyEntry}
                onCopyPayload={onCopyPayload}
              />
            )}
          </div>
        </div>
      </details>
    </div>
  );
};

const AgentComposer: React.FC<{
  activeSession: AgentSession | null;
  hasExistingSessions: boolean;
  onSendMessage: (message: string) => void | Promise<void>;
}> = ({ activeSession, hasExistingSessions, onSendMessage }) => {
  const composerId = useId();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAgentRunning = activeSession?.status === "running";

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting || isAgentRunning) return;

    setIsSubmitting(true);
    setValue("");
    try {
      await onSendMessage(trimmed);
    } catch (error) {
      setValue(trimmed);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="border-t border-slate-200 bg-white px-3 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <label htmlFor={composerId} className="sr-only">
        Agent conversation message
      </label>
      <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200/70">
        <textarea
          id={composerId}
          aria-label="Agent conversation message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          disabled={isSubmitting || isAgentRunning}
          rows={1}
          placeholder={
            isAgentRunning
              ? "Agent is working..."
              : activeSession
                ? "Reply to this agent conversation..."
                : hasExistingSessions
                  ? "Start a new agent conversation..."
                  : "Ask the agent to plan, edit, or inspect your tasks..."
          }
          className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-1 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!value.trim() || isSubmitting || isAgentRunning}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          aria-label="Send agent message"
          title="Send agent message"
        >
          <Icon name={isSubmitting ? "Loader2" : "SendHorizontal"} size={16} />
        </button>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Enter sends, Shift+Enter adds a line.
      </p>
    </form>
  );
};

export const AgentConversationPanel: React.FC<AgentConversationPanelProps> = ({
  isOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onStartNewSession,
  onDeleteSession,
  onSendMessage,
  onClose,
  onClear,
}) => {
  const panelId = useId();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const deleteFeedbackTimerRef = useRef<number | null>(null);
  const { copy, getStatus: getCopyStatus } = useCopyFeedback();
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<
    string | null
  >(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const activeSession = activeSessionId
    ? (sessions.find((session) => session.id === activeSessionId) ?? null)
    : null;
  const isComposingNewSession = sessions.length > 0 && !activeSession;
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [sessions],
  );
  const activeTrajectory = useMemo(
    () => (activeSession ? formatTrajectoryForCopy(activeSession) : ""),
    [activeSession],
  );
  const displayItems = useMemo(
    () =>
      activeSession ? groupAgentEntriesForDisplay(activeSession.entries) : [],
    [activeSession],
  );
  const activeSessionDomId = activeSession
    ? sanitizeDomId(activeSession.id)
    : null;
  const activeTabId = activeSessionDomId
    ? `${panelId}-tab-${activeSessionDomId}`
    : `${panelId}-tab-new`;
  const activePanelId = activeSessionDomId
    ? `${panelId}-panel-${activeSessionDomId}`
    : `${panelId}-panel-new`;
  const activeSessionEntryCount = activeSession?.entries.length ?? 0;
  const activeSessionUpdatedAt = activeSession?.updatedAt ?? "";
  const latestProgressText = activeSession
    ? getLatestProgressText(activeSession)
    : null;
  const latestSession = sortedSessions[0] ?? null;
  const isConfirmingDelete =
    activeSession !== null && pendingDeleteSessionId === activeSession.id;

  useEffect(
    () => () => {
      if (deleteFeedbackTimerRef.current !== null) {
        window.clearTimeout(deleteFeedbackTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !activeSession) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [activeSession, activeSessionEntryCount, activeSessionUpdatedAt, isOpen]);

  const showDeleteFeedback = useCallback((message: string) => {
    if (deleteFeedbackTimerRef.current !== null) {
      window.clearTimeout(deleteFeedbackTimerRef.current);
    }

    setDeleteFeedback(message);
    deleteFeedbackTimerRef.current = window.setTimeout(() => {
      setDeleteFeedback(null);
      deleteFeedbackTimerRef.current = null;
    }, 2200);
  }, []);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setPendingDeleteSessionId(null);
      onSelectSession(sessionId);
    },
    [onSelectSession],
  );

  const handleStartNewSession = useCallback(() => {
    setPendingDeleteSessionId(null);
    onStartNewSession();
  }, [onStartNewSession]);

  const handleDeleteActiveSession = useCallback(() => {
    if (!activeSession) {
      return;
    }

    setPendingDeleteSessionId(activeSession.id);
  }, [activeSession]);

  const confirmDeleteActiveSession = useCallback(() => {
    if (!activeSession) {
      return;
    }

    const deletedPrompt = truncateText(activeSession.prompt, 64);

    if (onDeleteSession) {
      onDeleteSession(activeSession.id);
    } else {
      onClear?.();
    }

    setPendingDeleteSessionId(null);
    showDeleteFeedback(`Deleted "${deletedPrompt}".`);
  }, [activeSession, onClear, onDeleteSession, showDeleteFeedback]);

  const handleCopyEntry = useCallback(
    (entry: AgentEntry) => {
      void copy(`entry:${entry.id}`, formatEntryForCopy(entry));
    },
    [copy],
  );

  const handleCopyPayload = useCallback(
    (entry: AgentEntry) => {
      void copy(`payload:${entry.id}`, formatPayloadForCopy(entry.payload));
    },
    [copy],
  );

  const handleCopyTrajectory = useCallback(async () => {
    if (!activeTrajectory) {
      return;
    }

    await copy("trajectory", activeTrajectory);
  }, [activeTrajectory, copy]);

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          role="region"
          aria-label="Agent conversation"
          aria-live="polite"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onClose();
            }
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
        >
          <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon name="Bot" size={16} className="text-blue-500" />
                <h3 className="text-sm font-black text-slate-900">
                  Agent conversation
                </h3>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {activeSession
                  ? `${activeSession.provider} · ${activeSession.model || "default model"}`
                  : sessions.length > 0
                    ? "New conversation ready"
                    : "No agent sessions yet"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {activeSession && (
                <button
                  type="button"
                  onClick={() => void handleCopyTrajectory()}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                    getCopyStatus("trajectory") === "copied"
                      ? "bg-emerald-50 text-emerald-600"
                      : getCopyStatus("trajectory") === "error"
                        ? "bg-rose-50 text-rose-600"
                        : "text-slate-400 hover:bg-white hover:text-blue-500",
                  )}
                  aria-label={`${getCopyStatusLabel(
                    getCopyStatus("trajectory"),
                  )} agent conversation trajectory`}
                  title={`${getCopyStatusLabel(
                    getCopyStatus("trajectory"),
                  )} agent conversation trajectory`}
                >
                  <Icon
                    name={
                      getCopyStatus("trajectory") === "copied"
                        ? "Check"
                        : getCopyStatus("trajectory") === "error"
                          ? "AlertCircle"
                          : "Copy"
                    }
                    size={15}
                  />
                  <span>{getCopyStatusLabel(getCopyStatus("trajectory"))}</span>
                </button>
              )}
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={handleStartNewSession}
                  className={cn(
                    "rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                    isComposingNewSession
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-400 hover:bg-white hover:text-blue-500",
                  )}
                  aria-label="Start new agent conversation"
                  title="Start new agent conversation"
                >
                  <Icon name="Plus" size={15} />
                </button>
              )}
              {activeSession && (
                <button
                  type="button"
                  onClick={handleDeleteActiveSession}
                  className={cn(
                    "rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                    isConfirmingDelete
                      ? "bg-rose-50 text-rose-600"
                      : "text-slate-400 hover:bg-white hover:text-rose-500",
                  )}
                  aria-label="Delete current agent conversation"
                  title={
                    isConfirmingDelete
                      ? "Confirm below to delete this conversation"
                      : "Delete current agent conversation"
                  }
                >
                  <Icon name="Trash2" size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Collapse agent conversation"
                title="Collapse agent conversation"
                data-testid="agent-panel-collapse"
              >
                <Icon name="ChevronUp" size={15} />
              </button>
            </div>
          </header>

          {(isConfirmingDelete || deleteFeedback) && (
            <div
              className={cn(
                "flex items-center justify-between gap-3 border-b px-4 py-2 text-xs",
                isConfirmingDelete
                  ? "border-rose-100 bg-rose-50 text-rose-800"
                  : "border-emerald-100 bg-emerald-50 text-emerald-800",
              )}
              role={isConfirmingDelete ? "group" : "status"}
              aria-live="polite"
            >
              <span className="min-w-0 truncate font-semibold">
                {isConfirmingDelete
                  ? `Delete "${truncateText(activeSession?.prompt ?? "", 64)}"?`
                  : deleteFeedback}
              </span>
              {isConfirmingDelete && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={confirmDeleteActiveSession}
                    className="rounded-md bg-rose-600 px-2 py-1 font-bold text-white transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    data-testid="agent-delete-confirm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteSessionId(null)}
                    className="rounded-md bg-white px-2 py-1 font-bold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    data-testid="agent-delete-cancel"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {sessions.length > 0 && (
            <div
              className="no-scrollbar flex snap-x gap-1 overflow-x-auto overscroll-x-contain border-b border-slate-100 bg-white px-3 py-2"
              role="tablist"
              aria-label="Agent conversation sessions"
            >
              {isComposingNewSession && (
                <button
                  type="button"
                  onClick={handleStartNewSession}
                  role="tab"
                  aria-selected
                  id={`${panelId}-tab-new`}
                  aria-controls={`${panelId}-panel-new`}
                  aria-label="New agent conversation draft"
                  className="max-w-44 shrink-0 snap-start rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-left text-[11px] font-semibold text-blue-700 transition-colors"
                >
                  <span className="block truncate">New conversation</span>
                  <span className="block truncate font-normal">
                    Draft ready
                  </span>
                </button>
              )}
              {sortedSessions.map((session) => (
                <button
                  type="button"
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  role="tab"
                  aria-selected={session.id === activeSession?.id}
                  id={`${panelId}-tab-${sanitizeDomId(session.id)}`}
                  aria-controls={`${panelId}-panel-${sanitizeDomId(
                    session.id,
                  )}`}
                  aria-label={getSessionTabLabel(session)}
                  className={cn(
                    "max-w-44 shrink-0 snap-start rounded-md border px-2 py-1 text-left text-[11px] font-semibold transition-colors",
                    session.id === activeSession?.id
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                  )}
                >
                  <span className="flex items-center gap-1 truncate">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        session.status === "running" && "bg-blue-500",
                        session.status === "complete" && "bg-emerald-500",
                        session.status === "error" && "bg-rose-500",
                      )}
                      aria-hidden
                    />
                    <span className="truncate">
                      {session.status === "running"
                        ? "Running"
                        : `${formatTime(session.updatedAt)} · ${getSessionStatusLabel(
                            session.status,
                          )}`}
                    </span>
                  </span>
                  <span className="block truncate font-normal">
                    {session.prompt}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div
            ref={scrollContainerRef}
            className="max-h-[min(60svh,560px)] overflow-y-auto overscroll-contain scroll-smooth bg-slate-50/60"
          >
            {activeSession ? (
              <div
                role="tabpanel"
                id={activePanelId}
                aria-labelledby={activeTabId}
                tabIndex={0}
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {activeSession.prompt}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      Started {formatTime(activeSession.startedAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      getStatusStyles(activeSession.status),
                    )}
                  >
                    {activeSession.status}
                  </span>
                </div>

                {activeSession.status === "running" && (
                  <div
                    className="sticky top-0 z-10 flex items-center gap-2 border-b border-blue-100 bg-blue-50/95 px-4 py-2 text-xs text-blue-800 backdrop-blur"
                    role="status"
                    aria-live="polite"
                  >
                    <Icon
                      name="Loader2"
                      size={14}
                      className="shrink-0 animate-spin"
                    />
                    <span className="min-w-0 truncate font-semibold">
                      {latestProgressText
                        ? `Running: ${latestProgressText}`
                        : "Running: waiting for the next agent update"}
                    </span>
                  </div>
                )}

                {displayItems.map((item) =>
                  item.type === "process" ? (
                    <AgentProcessBlock
                      key={item.id}
                      entries={item.entries}
                      isRunning={activeSession.status === "running"}
                      getCopyStatus={getCopyStatus}
                      onCopyEntry={handleCopyEntry}
                      onCopyPayload={handleCopyPayload}
                    />
                  ) : (
                    <AgentEntryRow
                      key={item.entry.id}
                      entry={item.entry}
                      copyStatus={getCopyStatus(`entry:${item.entry.id}`)}
                      onCopyEntry={handleCopyEntry}
                    />
                  ),
                )}
              </div>
            ) : (
              <div
                role={sessions.length > 0 ? "tabpanel" : undefined}
                id={sessions.length > 0 ? activePanelId : undefined}
                aria-labelledby={sessions.length > 0 ? activeTabId : undefined}
                tabIndex={sessions.length > 0 ? 0 : undefined}
                className="flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center text-slate-400"
              >
                <Icon name="MessageSquareText" size={32} />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  {sessions.length > 0
                    ? "Starting a new conversation"
                    : "No agent conversation yet"}
                </p>
                <p className="mt-1 max-w-64 text-xs leading-relaxed">
                  {sessions.length > 0
                    ? "Previous sessions are still available above. Send a message below to start this new thread."
                    : "Send a message below to start a new agent conversation."}
                </p>
                {isComposingNewSession && latestSession && (
                  <button
                    type="button"
                    onClick={() => handleSelectSession(latestSession.id)}
                    className="mt-4 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <Icon name="ArrowLeft" size={13} />
                    Exit draft
                  </button>
                )}
              </div>
            )}
          </div>
          <AgentComposer
            activeSession={activeSession}
            hasExistingSessions={sessions.length > 0}
            onSendMessage={onSendMessage}
          />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};
