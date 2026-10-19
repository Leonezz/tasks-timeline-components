import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownText, MarkdownTextMarkdown } from "./MarkdownText";
import { isPlainMarkdownText } from "./markdown-plain-text";

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

  it("lets inline markdown inherit white-space so parents can truncate", () => {
    const html = renderToStaticMarkup(
      <MarkdownText
        content="A long title"
        inline
        paragraphClassName="inline"
      />,
    );

    expect(html).not.toContain("whitespace-pre-wrap");
    expect(html).toContain('class="inline"');
  });

  it("keeps line breaks in block markdown", () => {
    const html = renderToStaticMarkup(<MarkdownText content="Line one" />);

    expect(html).toContain("whitespace-pre-wrap");
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

  describe("plain-text fast path", () => {
    const PLAIN = [
      "Buy milk",
      "Buy milk  ",
      "Call mom, then (maybe) dad?",
      "Pay 50% of $20 - today!",
      "a   b",
      "Version 2.0/3.1 = done; ok: yes",
      "Someday item 12",
      "另一个中文任务，带标点。",
      "Ünïcödé — dash “quotes”",
      "\u00a0leading nbsp",
    ];
    const NOT_PLAIN = [
      "- item",
      "-",
      "+ item",
      "1. step",
      "2026.",
      "3) step",
      "---",
      "    indented code",
      " leading space",
      "see www.example.com",
      "go to https://example.com",
      "x & y",
      "**bold**",
      "snake_case",
      "`code`",
      "[link](x)",
      "# heading",
      "a\nb",
      "a ~~b~~",
      "a | b",
      "mail me@example.com",
      "<b>html</b>",
      "back\\slash",
    ];

    it.each(PLAIN)("treats %j as plain text", (content) => {
      expect(isPlainMarkdownText(content)).toBe(true);
    });

    it.each(NOT_PLAIN)("sends %j through the markdown parser", (content) => {
      expect(isPlainMarkdownText(content)).toBe(false);
    });

    const VARIANTS = [
      {
        inline: true,
        compact: true,
        paragraphClassName: "inline",
        className: "min-w-0",
      },
      { inline: true },
      { inline: false, compact: true, paragraphClassName: "text-sm" },
      { inline: false },
    ];

    it.each(
      PLAIN.flatMap((content) => VARIANTS.map((v) => [content, v] as const)),
    )("renders %j exactly like the markdown path (%o)", (content, variant) => {
      const fast = renderToStaticMarkup(
          <MarkdownText content={content} {...variant} />,
        ),
        markdown = renderToStaticMarkup(
          <MarkdownTextMarkdown content={content} {...variant} />,
        );

      expect(fast).toBe(markdown);
    });
  });
});
