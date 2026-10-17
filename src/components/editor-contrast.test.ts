import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * WCAG AA contrast of the task editor's text (labels, the recurrence summary,
 * selected toggles, the warning and the save error) in every theme, computed
 * from the theme tokens in index.css. Body-size text needs 4.5:1.
 */

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

type Rgb = readonly [number, number, number];

/**
 * The `--name: value` tokens declared in the first block matching `selector`.
 * Comments are skipped, since they can name tokens ("as --slate-500: …"), and
 * a statement that isn't one `--name: value` declaration throws.
 */
function tokensOf(selector: string, source = css): Record<string, string> {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = text.indexOf(selector);
  if (start === -1) {
    throw new Error(`No "${selector}" block`);
  }
  const body = text.slice(
    text.indexOf("{", start) + 1,
    text.indexOf("}", start),
  );
  const declarations = body
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean);
  return Object.fromEntries(
    declarations.map((declaration) => {
      const match = /^(--[\w-]+):\s*([^:]+)$/.exec(declaration);
      if (!match) {
        throw new Error(
          `Unreadable declaration in "${selector}": ${declaration}`,
        );
      }
      return [match[1], match[2].trim()];
    }),
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

describe("task editor text contrast", () => {
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

  // Selected weekday, month and day toggles: text-white on bg-blue-600.
  // white is --background, so it is dark where the dark themes make blue light
  it.each(Object.entries(THEMES))(
    "selected toggles meet AA in the %s theme",
    (_theme, tokens) => {
      expect(
        contrast(
          colorOf(tokens, "--background"),
          colorOf(tokens, "--blue-600"),
        ),
      ).toBeGreaterThanOrEqual(AA);
    },
  );

  // The save error (text-rose-700) on the footer (bg-slate-50)
  it.each(Object.entries(THEMES))(
    "the save error meets AA in the %s theme",
    (_theme, tokens) => {
      expect(
        contrast(colorOf(tokens, "--rose-700"), colorOf(tokens, "--slate-50")),
      ).toBeGreaterThanOrEqual(AA);
    },
  );

  // "Saving replaces the stored rule…" (text-amber-800) in the summary
  it.each(Object.entries(THEMES))(
    "the warning about dropped rule parts meets AA in the %s theme",
    (_theme, tokens) => {
      expect(
        contrast(
          colorOf(tokens, "--amber-800"),
          SURFACES["recurrence summary"](tokens),
        ),
      ).toBeGreaterThanOrEqual(AA);
    },
  );

  it("blue-500, which selected toggles no longer use, fails AA with white in the light theme", () => {
    const light = THEMES.light;

    expect(
      contrast(colorOf(light, "--background"), colorOf(light, "--blue-500")),
    ).toBeLessThan(AA);
  });

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
    // Declared under a comment that names another token
    expect(THEMES.coffee["--muted-foreground"]).toBe("30 10% 40%");
  });

  it("fails on a declaration it can't read instead of dropping it", () => {
    // Without the semicolon, --b would become part of --a's value
    expect(() => tokensOf("a {", "a { --a: 0 0% 0% --b: 0 0% 100%; }")).toThrow(
      /--b/,
    );
  });
});
