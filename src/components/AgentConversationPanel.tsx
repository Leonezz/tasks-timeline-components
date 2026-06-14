import React, { useMemo, useState } from "react";
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
  onSendMessage: (message: string) => void | Promise<void>;
  onClose: () => void;
  onClear: () => void;
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
      return "bg-blue-100 text-blue-700";
    case "complete":
      return "bg-emerald-100 text-emerald-700";
    case "error":
      return "bg-rose-100 text-rose-700";
  }
}

const AgentEntryRow: React.FC<{ entry: AgentEntry }> = ({ entry }) => {
  const payload = stringifyPayload(entry.payload);
  const isUser = entry.kind === "user";
  const isAssistant = entry.kind === "assistant";
  const preview = getEntryPreview(entry, payload);

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
              "border-slate-200 bg-white text-slate-800 shadow-slate-100",
            entry.kind === "error" &&
              "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-100/40",
          )}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <h4 className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {entry.title}
            </h4>
            <span className="shrink-0 font-mono text-[10px] text-slate-400">
              {formatTime(entry.timestamp)}
            </span>
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

  return (
    <div className="px-4 py-1.5">
      <details className="group rounded-md border border-slate-100 bg-slate-50/70 text-slate-600">
        <summary className="flex cursor-pointer list-none items-start gap-2 px-3 py-2 outline-none transition-colors hover:bg-white/55 focus-visible:ring-2 focus-visible:ring-blue-300 [&::-webkit-details-marker]:hidden">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
            <Icon name={getEntryIcon(entry)} size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-[11px] font-semibold text-slate-500">
                {entry.title}
              </h4>
              <span className="shrink-0 font-mono text-[10px] text-slate-400">
                {formatTime(entry.timestamp)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs leading-relaxed text-slate-500">
              {preview}
            </p>
          </div>
          <Icon
            name="ChevronDown"
            size={14}
            className="mt-1 shrink-0 text-slate-300 transition-transform group-open:rotate-180"
          />
        </summary>
        {(entry.body || payload) && (
          <div className="border-t border-slate-100 px-3 pb-2 pt-2">
            {entry.body && (
              <MarkdownText
                content={entry.body}
                className="text-xs leading-relaxed text-slate-500"
                compact
              />
            )}
            {payload && (
              <details className={cn(entry.body ? "mt-2" : undefined)}>
                <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600">
                  Payload
                </summary>
                <pre className="mt-1 max-h-44 overflow-auto rounded-md border border-slate-200 bg-white/80 p-2 font-mono text-[10px] leading-relaxed text-slate-600">
                  {payload}
                </pre>
              </details>
            )}
          </div>
        )}
      </details>
    </div>
  );
};

const AgentComposer: React.FC<{
  activeSession: AgentSession | null;
  hasExistingSessions: boolean;
  onSendMessage: (message: string) => void | Promise<void>;
}> = ({ activeSession, hasExistingSessions, onSendMessage }) => {
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
      <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200/70">
        <textarea
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
  onSendMessage,
  onClose,
  onClear,
}) => {
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
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={onStartNewSession}
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
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-md p-2 text-slate-400 transition-colors hover:bg-white hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Clear agent conversation"
                  title="Clear agent conversation"
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
              >
                <Icon name="ChevronUp" size={15} />
              </button>
            </div>
          </header>

          {sessions.length > 0 && (
            <div className="no-scrollbar flex snap-x gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2">
              <button
                type="button"
                onClick={onStartNewSession}
                aria-pressed={isComposingNewSession}
                className={cn(
                  "max-w-44 shrink-0 snap-start rounded-md border px-2 py-1 text-left text-[11px] font-semibold transition-colors",
                  isComposingNewSession
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span className="block truncate">New conversation</span>
                <span className="block truncate font-normal">New thread</span>
              </button>
              {sortedSessions.map((session) => (
                <button
                  type="button"
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  aria-pressed={session.id === activeSession?.id}
                  className={cn(
                    "max-w-44 shrink-0 snap-start rounded-md border px-2 py-1 text-left text-[11px] font-semibold transition-colors",
                    session.id === activeSession?.id
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                  )}
                >
                  <span className="block truncate">
                    {session.status === "running"
                      ? "Running"
                      : `${formatTime(session.updatedAt)} · ${session.status}`}
                  </span>
                  <span className="block truncate font-normal">
                    {session.prompt}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="max-h-[min(60svh,560px)] overflow-y-auto bg-slate-50/60">
            {activeSession ? (
              <div>
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

                {activeSession.entries.map((entry) => (
                  <AgentEntryRow key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center text-slate-400">
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
