import { Icon } from "../Icon";

export const Documentation = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/10">
    {/* Section: Task Lifecycle (Existing) */}
    <section>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icon name="Activity" size={14} className="text-blue-500" />
        Task Lifecycle & Auto-Status
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        The view automatically manages task statuses based on dates to keep your
        workflow organized. You rarely need to manually set status unless
        completing a task.
      </p>
      {/* ... Existing Lifecycle Cards ... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="AlertCircle" size={14} className="text-rose-500" />
            <span className="font-bold text-slate-700 text-xs uppercase">
              Due / Overdue
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tasks due Today, Tomorrow, or in the past are automatically flagged
            as Urgent.
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Clock" size={14} className="text-blue-500" />
            <span className="font-bold text-slate-700 text-xs uppercase">
              Scheduled (Doing)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tasks with a future Start Date are marked as Scheduled until that
            date arrives.
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Zap" size={14} className="text-purple-500" />
            <span className="font-bold text-slate-700 text-xs uppercase">
              Unplanned
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tasks without dates that need immediate attention. You must manually
            set this.
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Archive" size={14} className="text-slate-500" />
            <span className="font-bold text-slate-700 text-xs uppercase">
              Backlog
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Items with no Due Date or Start Date appear in the Backlog section.
          </p>
        </div>
      </div>
    </section>

    <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />

    {/* Section: Scripting Guide (NEW) */}
    <section>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icon name="Code2" size={14} className="text-emerald-500" />
        Scripting Guide
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        Unlock advanced control by writing short JavaScript snippets to filter
        and sort your tasks precisely.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Icon name="Filter" size={12} className="text-slate-400" />
            Filter Script
          </h4>
          <div className="bg-[#1e1e1e] rounded-lg p-3 border border-slate-700 font-mono text-[10px] text-slate-300 shadow-inner">
            <p className="text-slate-500 mb-1">
              // Ex: Show only high priority tasks due today
            </p>
            <p>
              <span className="text-purple-400">const</span> today ={" "}
              <span className="text-blue-400">new</span>{" "}
              Date().toISOString().split('T')[0];
            </p>
            <p>
              <span className="text-purple-400">return</span> task.priority ===
              'high' && task.dueDate === today;
            </p>
          </div>
          <p className="text-xs text-slate-500">
            <b>Variable:</b> <code>task</code> (The Task object).
            <br />
            <b>Return:</b> <code>true</code> to keep, <code>false</code> to
            hide.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Icon name="ArrowUpDown" size={12} className="text-slate-400" />
            Sort Script
          </h4>
          <div className="bg-[#1e1e1e] rounded-lg p-3 border border-slate-700 font-mono text-[10px] text-slate-300 shadow-inner">
            <p className="text-slate-500 mb-1">
              // Ex: Sort by title length, then alphabetically
            </p>
            <p>
              <span className="text-purple-400">if</span> (a.title.length !==
              b.title.length) <span className="text-purple-400">return</span>{" "}
              a.title.length - b.title.length;
            </p>
            <p>
              <span className="text-purple-400">return</span>{" "}
              a.title.localeCompare(b.title);
            </p>
          </div>
          <p className="text-xs text-slate-500">
            <b>Variables:</b> <code>a</code>, <code>b</code> (Two Task objects
            to compare).
            <br />
            <b>Return:</b> Negative number if a &lt; b, Positive if a &gt; b, 0
            if equal.
          </p>
        </div>
      </div>
    </section>

    <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />

    {/* Section: AI & Voice */}
    <section>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icon name="Sparkles" size={14} className="text-purple-500" />
        AI & Voice Intelligence
      </h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Icon name="Mic" size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Voice Commands
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Click the microphone icon to speak. Supports natural language like
              "Buy milk tomorrow priority high".
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Icon name="TerminalSquare" size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">AI Mode</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle AI mode to use Gemini. It can Create, Update, Query, and
              Delete tasks.
              <br />
              <em className="opacity-80">
                Example: "Move all overdue tasks to next friday" or "Summarize
                my high priority work".
              </em>
            </p>
          </div>
        </div>
      </div>
    </section>

    <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />

    {/* Section: Controls */}
    <section>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icon name="Command" size={14} className="text-slate-500" />
        Quick Controls
      </h3>
      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <li className="flex items-center gap-2">
          <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
            Enter
          </code>
          <span>Save task / Submit command</span>
        </li>
        <li className="flex items-center gap-2">
          <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
            Double Click Delete
          </code>
          <span>Click trash icon once to arm, twice to delete.</span>
        </li>
        <li className="flex items-center gap-2">
          <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
            Focus Mode
          </code>
          <span>Hides everything except Today's active tasks.</span>
        </li>
      </ul>
    </section>
  </div>
);
