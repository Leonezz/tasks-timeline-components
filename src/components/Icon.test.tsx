import { renderToStaticMarkup } from "react-dom/server";
// The registry check below needs every Lucide export. Library code must not
// do this: a namespace import keeps all Lucide icons in the bundle.
// eslint-disable-next-line no-restricted-syntax
import * as Lucide from "lucide-react";
import { describe, expect, it } from "vitest";
import type { LucideIconName } from "../types";
import { Icon } from "./Icon";
import { ICONS } from "./icon-registry";

describe("Icon", () => {
  it("renders a registered icon as an svg with the given size and class", () => {
    const html = renderToStaticMarkup(
      <Icon name="Check" size={20} className="text-emerald-500" />,
    );

    expect(html).toContain("<svg");
    expect(html).toContain('width="20"');
    expect(html).toContain("text-emerald-500");
  });

  it("throws for a Lucide icon the library does not bundle", () => {
    const name = "Rocket" as LucideIconName;

    expect(() => renderToStaticMarkup(<Icon name={name} />)).toThrow(
      /Unknown icon "Rocket"/,
    );
    expect(() => renderToStaticMarkup(<Icon name={name} />)).toThrow(
      /import it from "lucide-react"/,
    );
  });

  it("does not resolve names inherited from Object.prototype", () => {
    for (const name of ["toString", "constructor", "__proto__"]) {
      expect(() =>
        renderToStaticMarkup(<Icon name={name as LucideIconName} />),
      ).toThrow(`Unknown icon "${name}"`);
    }
  });
});

describe("ICONS", () => {
  it("maps every name to the Lucide icon of the same name", () => {
    for (const [name, icon] of Object.entries(ICONS)) {
      expect(icon, name).toBe(Lucide[name as keyof typeof Lucide]);
    }
  });
});
