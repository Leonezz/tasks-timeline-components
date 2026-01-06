import { Icon } from "../Icon";

export const About = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/10">
    <section className="text-center space-y-3 pt-4">
      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-slate-950">
        <Icon name="CheckSquare" size={32} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Tasks Timeline View
        </h3>
        <p className="text-xs text-slate-500 font-mono">
          v{__APP_VERSION__} • Built at {__COMMIT_HASH__}
        </p>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
        A high-fidelity, timeline-based task management tool designed for focus,
        clarity, and AI-assisted productivity.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        Connect & Contribute
      </h3>

      <div className="grid grid-cols-1 gap-2">
        <a
          href="https://github.com/Leonezz/tasks-timeline-components"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:scale-105 transition-transform text-slate-700 dark:text-slate-300">
            <Icon name="Github" size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              GitHub Repository
            </div>
            <div className="text-xs text-slate-500">
              View source code, report issues, or contribute.
            </div>
          </div>
          <Icon
            name="ExternalLink"
            size={14}
            className="text-slate-400 group-hover:text-blue-500 transition-colors"
          />
        </a>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        Support Development
      </h3>
      <div className="rounded-xl border border-rose-100 bg-rose-50/50 dark:bg-rose-900/10 dark:border-rose-900/20 p-4 space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          If you find this tool useful, consider supporting its development.
          Your contribution helps keep the updates coming!
        </p>
        <div className="grid grid-cols-4 gap-3">
          <a
            href="https://buymeacoffee.com/zhuwenqa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFDD00] text-slate-900 font-bold rounded-lg hover:brightness-95 transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
          >
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
            />
          </a>
          <a
            href="https://ko-fi.com/zhuwenqa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#29abe0] text-white font-bold rounded-lg hover:brightness-95 transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
          >
            <Icon name="CoffeeIcon" size={16} />
            <span>Ko-fi</span>
          </a>
          <a
            href="https://patreon.com/zhuwenq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#29abe0] text-white font-bold rounded-lg hover:brightness-95 transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
          >
            <Icon name="Star" size={16} />
            <span>Patreon</span>
          </a>
          <a
            href="https://www.paypal.com/paypalme/zhuwenq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#29abe0] text-white font-bold rounded-lg hover:brightness-95 transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
          >
            <Icon name="Wallet2" size={16} />
            <span>Paypal</span>
          </a>
        </div>
      </div>
    </section>

    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
      <p className="text-[10px] text-slate-400 leading-relaxed">
        Built with React, Tailwind, Framer Motion & Gemini AI. <br />
        MIT License © {new Date().getFullYear()} Chronos
      </p>
    </div>
  </div>
);
