import type { ThemeOption } from "@/types";
import { cn } from "@/utils";

const THEMES: { id: ThemeOption; name: string; colors: string }[] = [
  { id: "system", name: "System", colors: "bg-slate-400 border-slate-700" },
  { id: "light", name: "Light", colors: "bg-white border-slate-200" },
  { id: "dark", name: "Dark", colors: "bg-slate-900 border-slate-700" },
  { id: "midnight", name: "Midnight", colors: "bg-[#0B1120] border-slate-800" },
  { id: "coffee", name: "Coffee", colors: "bg-[#f5f2eb] border-[#e8e4db]" },
];

interface ThemeSectionProps {
  theme: ThemeOption;
  setTheme: (t: ThemeOption) => void;
}

export const ThemeSection = ({ theme, setTheme }: ThemeSectionProps) => (
  <>
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
      Appearance
    </h3>
    <div className="grid grid-cols-5 gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all outline-none",
            theme === t.id
              ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-200 dark:ring-blue-900"
              : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50",
          )}
        >
          <div
            className={cn(
              "w-full aspect-square rounded-lg shadow-sm border border-slate-200/20",
              t.colors,
            )}
          />
          <span
            className={cn(
              "text-[10px] font-medium truncate w-full text-center",
              theme === t.id ? "text-blue-600" : "text-slate-500",
            )}
          >
            {t.name}
          </span>
        </button>
      ))}
    </div>
  </>
);
