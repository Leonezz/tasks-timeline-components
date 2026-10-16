import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * WCAG AA contrast of the task editor's secondary text (labels, the
 * recurrence summary) in every theme, computed from the theme tokens in
 * index.css. Body-size text needs 4.5:1.
 */

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

type Rgb = readonly [number, number, number];

/** The `--name: h s% l%` tokens declared in the first block matching `selector`. */
function tokensOf(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) {
    throw new Error(`No "${selector}" block in index.css`);
  }
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
}

const lightTokens = tokensOf(":root,\n.tasks-timeline-app {");
const themeTokens = (theme: string) => ({
  // Themes override the light tokens they redefine
  ...lightTokens,
  ...tokensOf(`.tasks-timeline-app[data-theme="${theme}"] {`),
});

const THEMES: Record<string, Record<string, string>> = {
  light: lightTokens,
  dark: themeTokens("dark"),
  midnight: themeTokens("midnight"),
  coffee: themeTokens("coffee"),
};

/** An `h s% l%` token as sRGB channels (0-255). */
function colorOf(tokens: Record<string, string>, name: string): Rgb {
  const value = tokens[name];
  const match = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(value ?? "");
  if (!match) {
    throw new Error(`Token ${name} is not "h s% l%": ${value}`);
  }
  const [h, s, l] = [
    Number(match[1]),
    Number(match[2]) / 100,
    Number(match[3]) / 100,
  ];
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [channel(0), channel(8), channel(4)];
}

/** `top` at `alpha` over `bottom`, as Tailwind's `/50` opacity renders it. */
const over = (top: Rgb, alpha: number, bottom: Rgb): Rgb => [
  top[0] * alpha + bottom[0] * (1 - alpha),
  top[1] * alpha + bottom[1] * (1 - alpha),
  top[2] * alpha + bottom[2] * (1 - alpha),
];

const luminance = (rgb: Rgb): number => {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: Rgb, b: Rgb): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** Where the editor shows `text-slate-500` secondary text. */
const SURFACES: Record<string, (tokens: Record<string, string>) => Rgb> = {
  // bg-paper: the dialog ("Task Dates", field labels)
  dialog: (t) => colorOf(t, "--card"),
  // bg-slate-50: the recurrence box ("Repeats automatically", "Months")
  "recurrence box": (t) => colorOf(t, "--slate-50"),
  // bg-white/50 on the recurrence box: the recurrence summary
  "recurrence summary": (t) =>
    over(colorOf(t, "--background"), 0.5, colorOf(t, "--slate-50")),
  // bg-white: unselected weekday, month and day buttons
  "toggle button": (t) => colorOf(t, "--background"),
};

const AA = 4.5;

describe("task editor secondary text contrast", () => {
  const cases = Object.entries(THEMES).flatMap(([theme, tokens]) =>
    Object.entries(SURFACES).map(
      ([surface, background]) => [theme, surface, tokens, background] as const,
    ),
  );

  it.each(cases)(
    "slate-500 text meets AA in the %s theme on the %s",
    (_theme, _surface, tokens, background) => {
      expect(
        contrast(colorOf(tokens, "--slate-500"), background(tokens)),
      ).toBeGreaterThanOrEqual(AA);
    },
  );

  // The date pickers' placeholder text ("Select due date") on bg-background
  it.each(Object.entries(THEMES))(
    "muted-foreground text meets AA in the %s theme",
    (_theme, tokens) => {
      expect(
        contrast(
          colorOf(tokens, "--muted-foreground"),
          colorOf(tokens, "--background"),
        ),
      ).toBeGreaterThanOrEqual(AA);
    },
  );

  it("slate-400, which the editor no longer uses for text, fails AA on the light dialog", () => {
    const light = THEMES.light;

    expect(
      contrast(colorOf(light, "--slate-400"), colorOf(light, "--card")),
    ).toBeLessThan(AA);
  });

  it("reads the theme tokens it checks", () => {
    // Guards against the parser silently falling back to the light tokens
    expect(THEMES.coffee["--card"]).not.toBe(lightTokens["--card"]);
    expect(THEMES.dark["--slate-500"]).not.toBe(lightTokens["--slate-500"]);
    expect(THEMES.midnight["--background"]).not.toBe(
      lightTokens["--background"],
    );
  });
});
