/**
 * Detects text that Markdown would render as one plain paragraph, so
 * MarkdownText can skip the unified/remark pipeline for it (most task
 * titles). It is deliberately conservative: anything that might be Markdown
 * syntax goes through the parser.
 *
 * Plain means: no line breaks, no leading space or tab (indented code), only
 * letters, digits, spaces, a few punctuation marks Markdown never treats as
 * syntax mid-line, and non-ASCII characters (Markdown syntax is ASCII only).
 * List markers at the start, thematic breaks and autolink literals are
 * excluded as well.
 */
// eslint-disable-next-line no-control-regex
const PLAIN_CHARS = /^(?:[A-Za-z0-9 ,.;:'"?!()/+=%$-]|[^\x00-\x7F\p{Cc}])+$/u;
const LIST_MARKER = /^(?:[-+]|\d{1,9}[.)])(?:[ \t]|$)/;
const THEMATIC_BREAK = /^-(?:[ \t]*-){2,}[ \t]*$/;
const AUTOLINK_LITERAL = /(?:https?|ftp|mailto|xmpp):|www\./i;

export const isPlainMarkdownText = (content: string): boolean =>
  PLAIN_CHARS.test(content) &&
  !/^[ \t]/.test(content) &&
  !LIST_MARKER.test(content) &&
  !THEMATIC_BREAK.test(content) &&
  !AUTOLINK_LITERAL.test(content);

/** The paragraph text Markdown would produce: trailing spaces dropped. */
export const plainMarkdownParagraph = (content: string): string =>
  content.replace(/[ \t]+$/, "");
