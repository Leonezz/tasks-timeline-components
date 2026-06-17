import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownText } from "./MarkdownText";

describe("MarkdownText", () => {
  it("renders paragraphs, lists, and code blocks", () => {
    const html = renderToStaticMarkup(
      <MarkdownText
        content={
          "Plan:\n\n- Review tasks\n- Ship UI\n\n```ts\nconst ok = true;\n```"
        }
      />,
    );

    expect(html).toContain("<p");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("<pre");
    expect(html).toContain("const ok = true;");
  });

  it("renders common inline markdown without raw html", () => {
    const html = renderToStaticMarkup(
      <MarkdownText content="**Bold** and *em* with `code` plus [docs](https://example.com)" />,
    );

    expect(html).toContain("<strong");
    expect(html).toContain("<em");
    expect(html).toContain("<code");
    expect(html).toContain('href="https://example.com"');
  });

  it("renders inline markdown without paragraph wrappers", () => {
    const html = renderToStaticMarkup(
      <MarkdownText
        content="**Bold** and `code`"
        inline
        paragraphClassName="inline"
      />,
    );

    expect(html).toContain("<span");
    expect(html).not.toContain("<p");
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
  });

  it("drops unsafe link hrefs", () => {
    const html = renderToStaticMarkup(
      <MarkdownText content="[bad](javascript:alert(1))" />,
    );

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
    expect(html).toContain("bad");
  });

  it("renders markdown tables with inline content and alignment", () => {
    const html = renderToStaticMarkup(
      <MarkdownText
        content={
          "| Task | Status | Count |\n| :--- | :---: | ---: |\n| **Ship** | `done` | 3 |"
        }
      />,
    );

    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("text-left");
    expect(html).toContain("text-center");
    expect(html).toContain("text-right");
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
  });
});
