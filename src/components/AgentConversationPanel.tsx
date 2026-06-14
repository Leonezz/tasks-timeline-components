import React from "react";
import { AnimatePresence } from "framer-motion";
import type { AgentEntry, AgentSession, LucideIconName } from "../types";
import { cn } from "../utils";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";

interface AgentConversationPanelProps {
  isOpen: boolean;
  sessions: AgentSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
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

function getEntryStyles(entry: AgentEntry): string {
  switch (entry.kind) {
    case "user":
      return "border-slate-100 bg-white text-slate-800";
    case "assistant":
      return "border-blue-100 bg-blue-50/50 text-slate-800";
    case "tool-call":
      return "border-amber-100 bg-amber-50/50 text-slate-800";
    case "tool-result":
      return "border-emerald-100 bg-emerald-50/50 text-slate-800";
    case "error":
      return "border-rose-100 bg-rose-50/60 text-rose-900";
    case "status":
      return "border-slate-100 bg-slate-50/70 text-slate-700";
  }
}

const AgentEntryRow: React.FC<{ entry: AgentEntry }> = ({ entry }) => {
  const payload = stringifyPayload(entry.payload);

  return (
    <div
      className={cn(
        "border-t px-4 py-3 first:border-t-0",
        getEntryStyles(entry),
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
          <Icon name={getEntryIcon(entry)} size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">
              {entry.title}
            </h4>
            <span className="shrink-0 font-mono text-[10px] text-slate-400">
              {formatTime(entry.timestamp)}
            </span>
          </div>
          {entry.body && (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {entry.body}
            </p>
          )}
          {payload && (
            <pre className="mt-2 max-h-44 overflow-auto rounded-md border border-slate-200 bg-white/80 p-2 font-mono text-[10px] leading-relaxed text-slate-600">
              {payload}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export const AgentConversationPanel: React.FC<AgentConversationPanelProps> = ({
  isOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onClose,
  onClear,
}) => {
  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ??
    sessions[sessions.length - 1] ??
    null;

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
                  : "No agent sessions yet"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
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

          {sessions.length > 1 && (
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2">
              {sessions.map((session, index) => (
                <button
                  type="button"
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "max-w-40 shrink-0 rounded-md border px-2 py-1 text-left text-[11px] font-semibold transition-colors",
                    session.id === activeSession?.id
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                  )}
                >
                  <span className="block truncate">Session {index + 1}</span>
                  <span className="block truncate font-normal">
                    {session.prompt}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="max-h-[min(42vh,360px)] overflow-y-auto bg-slate-50/60">
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
                      activeSession.status === "running" &&
                        "bg-blue-100 text-blue-700",
                      activeSession.status === "complete" &&
                        "bg-emerald-100 text-emerald-700",
                      activeSession.status === "error" &&
                        "bg-rose-100 text-rose-700",
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
                  No agent conversation yet
                </p>
                <p className="mt-1 max-w-64 text-xs leading-relaxed">
                  Turn on AI mode and send a prompt from the input bar to start
                  an agent session.
                </p>
              </div>
            )}
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};
