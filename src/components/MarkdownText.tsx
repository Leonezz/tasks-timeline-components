import React, { useMemo } from "react";
import { cn } from "../utils";

type MarkdownBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "code"; code: string; language?: string }
  | { type: "list"; ordered: boolean; items: string[] };

export interface MarkdownTextProps {
  content: string;
  className?: string;
  paragraphClassName?: string;
  listClassName?: string;
  listItemClassName?: string;
  preClassName?: string;
  codeClassName?: string;
  linkClassName?: string;
  compact?: boolean;
}

const FENCE_MARKER = "```";

function parseListItem(
  line: string,
): { ordered: boolean; content: string } | null {
  const unorderedMatch = /^\s*[-*+]\s+(.+)$/.exec(line);
  if (unorderedMatch) {
    return { ordered: false, content: unorderedMatch[1] };
  }

  const orderedMatch = /^\s*\d+[.)]\s+(.+)$/.exec(line);
  if (orderedMatch) {
    return { ordered: true, content: orderedMatch[1] };
  }

  return null;
}

function parseMarkdownTextBlocks(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n?/g, "\n").trim().split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith(FENCE_MARKER)) {
      const language =
        trimmedLine.slice(FENCE_MARKER.length).trim() || undefined;
      const codeLines: string[] = [];
      index += 1;

      while (
        index < lines.length &&
        !lines[index].trim().startsWith(FENCE_MARKER)
      ) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({ type: "code", code: codeLines.join("\n"), language });
      continue;
    }

    const firstListItem = parseListItem(line);
    if (firstListItem) {
      const items: string[] = [];
      const ordered = firstListItem.ordered;

      while (index < lines.length) {
        const item = parseListItem(lines[index]);
        if (!item || item.ordered !== ordered) {
          break;
        }

        items.push(item.content);
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const paragraphLine = lines[index];
      const trimmedParagraphLine = paragraphLine.trim();

      if (
        trimmedParagraphLine === "" ||
        trimmedParagraphLine.startsWith(FENCE_MARKER) ||
        parseListItem(paragraphLine)
      ) {
        break;
      }

      paragraphLines.push(trimmedParagraphLine);
      index += 1;
    }

    blocks.push({ type: "paragraph", lines: paragraphLines });
  }

  return blocks;
}

function findLinkEnd(text: string, startIndex: number): number {
  let depth = 0;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      if (depth === 0) {
        return index;
      }
      depth -= 1;
    }
  }

  return -1;
}

function getSafeHref(href: string): string | null {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedHref, "https://tasks-timeline.local");
    if (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:" ||
      parsedUrl.protocol === "mailto:"
    ) {
      return trimmedHref;
    }
  } catch {
    return null;
  }

  return null;
}

function findNextTokenIndex(text: string, startIndex: number): number {
  const tokenIndexes = ["`", "[", "*", "_", "\\"]
    .map((token) => text.indexOf(token, startIndex))
    .filter((index) => index >= 0);

  return tokenIndexes.length > 0 ? Math.min(...tokenIndexes) : text.length;
}

function renderInline(
  text: string,
  keyPrefix: string,
  classes: Pick<MarkdownTextProps, "codeClassName" | "linkClassName">,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (char === "\\") {
      const escapedChar = text[index + 1];
      nodes.push(escapedChar ?? char);
      index += escapedChar ? 2 : 1;
      continue;
    }

    if (char === "`") {
      const endIndex = text.indexOf("`", index + 1);
      if (endIndex > index + 1) {
        nodes.push(
          <code
            key={`${keyPrefix}-code-${index}`}
            className={cn(
              "rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em] text-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-100",
              classes.codeClassName,
            )}
          >
            {text.slice(index + 1, endIndex)}
          </code>,
        );
        index = endIndex + 1;
        continue;
      }
    }

    if (char === "[") {
      const labelEndIndex = text.indexOf("]", index + 1);
      if (labelEndIndex > index + 1 && text[labelEndIndex + 1] === "(") {
        const hrefEndIndex = findLinkEnd(text, labelEndIndex + 2);
        if (hrefEndIndex > labelEndIndex + 2) {
          const label = text.slice(index + 1, labelEndIndex);
          const href = getSafeHref(
            text.slice(labelEndIndex + 2, hrefEndIndex),
          );

          if (href) {
            nodes.push(
              <a
                key={`${keyPrefix}-link-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700 [.tasks-timeline-app[data-theme='dark']_&]:text-blue-300 [.tasks-timeline-app[data-theme='dark']_&]:decoration-blue-500 [.tasks-timeline-app[data-theme='dark']_&]:hover:text-blue-200",
                  classes.linkClassName,
                )}
              >
                {renderInline(label, `${keyPrefix}-link-${index}`, classes)}
              </a>,
            );
          } else {
            nodes.push(
              ...renderInline(
                label,
                `${keyPrefix}-unsafe-link-${index}`,
                classes,
              ),
            );
          }

          index = hrefEndIndex + 1;
          continue;
        }
      }
    }

    const boldToken = text.startsWith("**", index)
      ? "**"
      : text.startsWith("__", index)
        ? "__"
        : null;
    if (boldToken) {
      const endIndex = text.indexOf(boldToken, index + boldToken.length);
      if (endIndex > index + boldToken.length) {
        nodes.push(
          <strong key={`${keyPrefix}-strong-${index}`} className="font-bold">
            {renderInline(
              text.slice(index + boldToken.length, endIndex),
              `${keyPrefix}-strong-${index}`,
              classes,
            )}
          </strong>,
        );
        index = endIndex + boldToken.length;
        continue;
      }
    }

    if (char === "*" || char === "_") {
      const endIndex = text.indexOf(char, index + 1);
      if (endIndex > index + 1) {
        nodes.push(
          <em key={`${keyPrefix}-em-${index}`} className="italic">
            {renderInline(
              text.slice(index + 1, endIndex),
              `${keyPrefix}-em-${index}`,
              classes,
            )}
          </em>,
        );
        index = endIndex + 1;
        continue;
      }
    }

    const nextTokenIndex = findNextTokenIndex(text, index + 1);
    nodes.push(text.slice(index, nextTokenIndex));
    index = nextTokenIndex;
  }

  return nodes;
}

function renderParagraphLines(
  lines: string[],
  keyPrefix: string,
  classes: Pick<MarkdownTextProps, "codeClassName" | "linkClassName">,
): React.ReactNode[] {
  return lines.flatMap((line, index) => {
    const renderedLine = renderInline(
      line,
      `${keyPrefix}-line-${index}`,
      classes,
    );

    if (index === lines.length - 1) {
      return renderedLine;
    }

    return [
      ...renderedLine,
      <br key={`${keyPrefix}-line-break-${index}`} />,
    ];
  });
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  content,
  className,
  paragraphClassName,
  listClassName,
  listItemClassName,
  preClassName,
  codeClassName,
  linkClassName,
  compact = false,
}) => {
  const blocks = useMemo(() => parseMarkdownTextBlocks(content), [content]);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={cn(compact ? "space-y-1" : "space-y-2", className)}>
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <pre
              key={`block-${index}`}
              className={cn(
                "overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] leading-relaxed text-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:border-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-900/70 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-200",
                preClassName,
              )}
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";

          return (
            <ListTag
              key={`block-${index}`}
              className={cn(
                block.ordered ? "list-decimal" : "list-disc",
                "space-y-1 pl-4",
                listClassName,
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`block-${index}-item-${itemIndex}`}
                  className={listItemClassName}
                >
                  {renderInline(item, `block-${index}-item-${itemIndex}`, {
                    codeClassName,
                    linkClassName,
                  })}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={`block-${index}`} className={paragraphClassName}>
            {renderParagraphLines(block.lines, `block-${index}`, {
              codeClassName,
              linkClassName,
            })}
          </p>
        );
      })}
    </div>
  );
};
