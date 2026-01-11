import type { FontSize } from "@/types";
import { cn } from "@/utils";

const FONT_SIZES: { id: FontSize; label: string; class: string }[] = [
  { id: "sm", label: "Small", class: "text-sm" },
  { id: "base", label: "Medium", class: "text-base" },
  { id: "lg", label: "Large", class: "text-lg" },
  { id: "xl", label: "Extra Large", class: "text-xl" },
];

interface TypographySectionProps {
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
}
export const TypographySection = ({
  fontSize,
  setFontSize,
}: TypographySectionProps) => (
  <>
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
      Typography
    </h3>
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-500">
        Item Font Size
      </label>
      <div className="grid grid-cols-4 gap-2">
        {FONT_SIZES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFontSize(f.id)}
            className={cn(
              "py-2 px-1 rounded-lg border text-center transition-all",
              fontSize === f.id
                ? "border-blue-500 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-100 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400",
            )}
          >
            <span className={cn("block leading-none mb-1", f.class)}>Ag</span>
            <span className="text-[10px] opacity-70">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  </>
);
