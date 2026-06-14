import React, { useMemo } from "react";
import ReactMarkdown, {
  type Components,
  type UrlTransform,
} from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../utils";

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

const REMARK_PLUGINS = [remarkGfm];
const DISALLOWED_ELEMENTS = ["img"];

function getSafeUrl(url: string, key: string): string | undefined {
  if (key !== "href" && key !== "src") {
    return undefined;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(trimmedUrl, "https://tasks-timeline.local");
    if (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:" ||
      parsedUrl.protocol === "mailto:"
    ) {
      return trimmedUrl;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

const safeUrlTransform: UrlTransform = (url, key) => getSafeUrl(url, key);

function getAlignmentClass(
  textAlign: React.CSSProperties["textAlign"],
): string {
  switch (textAlign) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    case "left":
    default:
      return "text-left";
  }
}

function hasBlockCodeContent(
  children: React.ReactNode,
  markdownClassName?: string,
): boolean {
  if (markdownClassName?.includes("language-")) {
    return true;
  }

  if (typeof children === "string") {
    return children.includes("\n");
  }

  if (Array.isArray(children)) {
    return children.some((child) => hasBlockCodeContent(child));
  }

  return false;
}

function omitMarkdownNode<TProps extends { node?: unknown }>(
  props: TProps,
): Omit<TProps, "node"> {
  const { node, ...rest } = props;
  void node;
  return rest;
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
  const components = useMemo<Components>(
    () => ({
      p({ children, ...props }) {
        return (
          <p
            {...omitMarkdownNode(props)}
            className={cn(
              "whitespace-pre-wrap",
              compact ? "leading-relaxed" : undefined,
              paragraphClassName,
            )}
          >
            {children}
          </p>
        );
      },
      a({ href, children, ...props }) {
        const safeHref = href ? getSafeUrl(href, "href") : undefined;

        if (!safeHref) {
          return <>{children}</>;
        }

        return (
          <a
            {...omitMarkdownNode(props)}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700 [.tasks-timeline-app[data-theme='dark']_&]:text-blue-300 [.tasks-timeline-app[data-theme='dark']_&]:decoration-blue-500 [.tasks-timeline-app[data-theme='dark']_&]:hover:text-blue-200",
              linkClassName,
            )}
          >
            {children}
          </a>
        );
      },
      ul({ className: markdownClassName, children, ...props }) {
        const isTaskList = markdownClassName?.includes("contains-task-list");

        return (
          <ul
            {...omitMarkdownNode(props)}
            className={cn(
              isTaskList ? "list-none pl-0" : "list-disc pl-4",
              "space-y-1",
              listClassName,
            )}
          >
            {children}
          </ul>
        );
      },
      ol({ children, ...props }) {
        return (
          <ol
            {...omitMarkdownNode(props)}
            className={cn("list-decimal space-y-1 pl-4", listClassName)}
          >
            {children}
          </ol>
        );
      },
      li({ className: markdownClassName, children, ...props }) {
        const isTaskListItem = markdownClassName?.includes("task-list-item");

        return (
          <li
            {...omitMarkdownNode(props)}
            className={cn(
              isTaskListItem ? "flex list-none items-start gap-2" : undefined,
              listItemClassName,
            )}
          >
            {children}
          </li>
        );
      },
      input({ ...props }) {
        return (
          <input
            {...omitMarkdownNode(props)}
            disabled
            readOnly
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-blue-500"
          />
        );
      },
      strong({ children, ...props }) {
        return (
          <strong {...omitMarkdownNode(props)} className="font-bold">
            {children}
          </strong>
        );
      },
      em({ children, ...props }) {
        return (
          <em {...omitMarkdownNode(props)} className="italic">
            {children}
          </em>
        );
      },
      del({ children, ...props }) {
        return (
          <del {...omitMarkdownNode(props)} className="text-slate-400">
            {children}
          </del>
        );
      },
      blockquote({ children, ...props }) {
        return (
          <blockquote
            {...omitMarkdownNode(props)}
            className="border-l-2 border-slate-200 pl-3 text-slate-500 [.tasks-timeline-app[data-theme='dark']_&]:border-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-400"
          >
            {children}
          </blockquote>
        );
      },
      h1({ children, ...props }) {
        return (
          <h1
            {...omitMarkdownNode(props)}
            className="text-lg font-black leading-tight text-slate-900 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-100"
          >
            {children}
          </h1>
        );
      },
      h2({ children, ...props }) {
        return (
          <h2
            {...omitMarkdownNode(props)}
            className="text-base font-black leading-tight text-slate-900 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-100"
          >
            {children}
          </h2>
        );
      },
      h3({ children, ...props }) {
        return (
          <h3
            {...omitMarkdownNode(props)}
            className="text-sm font-bold leading-tight text-slate-800 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-100"
          >
            {children}
          </h3>
        );
      },
      h4({ children, ...props }) {
        return (
          <h4
            {...omitMarkdownNode(props)}
            className="text-sm font-bold leading-tight text-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-200"
          >
            {children}
          </h4>
        );
      },
      h5({ children, ...props }) {
        return (
          <h5
            {...omitMarkdownNode(props)}
            className="text-xs font-bold uppercase tracking-wide text-slate-500 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-300"
          >
            {children}
          </h5>
        );
      },
      h6({ children, ...props }) {
        return (
          <h6
            {...omitMarkdownNode(props)}
            className="text-xs font-semibold uppercase tracking-wide text-slate-400 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-400"
          >
            {children}
          </h6>
        );
      },
      pre({ children, ...props }) {
        return (
          <pre
            {...omitMarkdownNode(props)}
            className={cn(
              "overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] leading-relaxed text-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:border-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-900/70 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-200",
              preClassName,
            )}
          >
            {children}
          </pre>
        );
      },
      code({ className: markdownClassName, children, ...props }) {
        const isBlockCode = hasBlockCodeContent(children, markdownClassName);

        return (
          <code
            {...omitMarkdownNode(props)}
            className={cn(
              isBlockCode
                ? "font-mono"
                : "rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em] text-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-100",
              markdownClassName,
              codeClassName,
            )}
          >
            {children}
          </code>
        );
      },
      table({ children, ...props }) {
        return (
          <div className="overflow-x-auto rounded-md border border-slate-200 [.tasks-timeline-app[data-theme='dark']_&]:border-slate-700">
            <table
              {...omitMarkdownNode(props)}
              className={cn(
                "min-w-full border-collapse text-xs",
                compact ? "text-[11px]" : undefined,
              )}
            >
              {children}
            </table>
          </div>
        );
      },
      thead({ children, ...props }) {
        return (
          <thead
            {...omitMarkdownNode(props)}
            className="bg-slate-50 text-slate-600 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-800 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-200"
          >
            {children}
          </thead>
        );
      },
      tbody({ children, ...props }) {
        return (
          <tbody
            {...omitMarkdownNode(props)}
            className="bg-white text-slate-600 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-900/60 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-300"
          >
            {children}
          </tbody>
        );
      },
      th({ style, children, ...props }) {
        return (
          <th
            {...omitMarkdownNode(props)}
            className={cn(
              "border-b border-slate-200 px-2 py-1.5 font-semibold [.tasks-timeline-app[data-theme='dark']_&]:border-slate-700",
              getAlignmentClass(style?.textAlign),
            )}
          >
            {children}
          </th>
        );
      },
      td({ style, children, ...props }) {
        return (
          <td
            {...omitMarkdownNode(props)}
            className={cn(
              "border-t border-slate-100 px-2 py-1.5 align-top [.tasks-timeline-app[data-theme='dark']_&]:border-slate-800",
              getAlignmentClass(style?.textAlign),
            )}
          >
            {children}
          </td>
        );
      },
      hr({ ...props }) {
        return (
          <hr
            {...omitMarkdownNode(props)}
            className="border-slate-200 [.tasks-timeline-app[data-theme='dark']_&]:border-slate-700"
          />
        );
      },
    }),
    [
      codeClassName,
      compact,
      linkClassName,
      listClassName,
      listItemClassName,
      paragraphClassName,
      preClassName,
    ],
  );

  if (!content.trim()) {
    return null;
  }

  return (
    <div className={cn(compact ? "space-y-1" : "space-y-2", className)}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        skipHtml
        disallowedElements={DISALLOWED_ELEMENTS}
        unwrapDisallowed
        urlTransform={safeUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
