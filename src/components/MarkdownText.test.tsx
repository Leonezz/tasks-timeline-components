import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownText } from "./MarkdownText";

describe("MarkdownText", () => {
  it("renders paragraphs, lists, and code blocks", () => {
    const html = renderToStaticMarkup(
      <MarkdownText content={"Plan:\n\n- Review tasks\n- Ship UI\n\n```ts\nconst ok = true;\n```"} />,
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

  it("drops unsafe link hrefs", () => {
    const html = renderToStaticMarkup(
      <MarkdownText content="[bad](javascript:alert(1))" />,
    );

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
    expect(html).toContain("bad");
  });
});
