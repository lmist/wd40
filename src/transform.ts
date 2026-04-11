/**
 * Transform indented plain text into markdown with heading syntax.
 *
 * Input: plain text where indentation (2 spaces per level) represents hierarchy.
 * Output: markdown with # headings for the Rust parser.
 *
 * 0 spaces  → # (H1)
 * 2 spaces  → ## (H2)
 * 4 spaces  → ### (H3)
 * ...up to 10 spaces → ###### (H6)
 * 12+ spaces → ###### (clamped at H6)
 */

const MAX_LEVEL = 6;
const MARKDOWN_HEADING_PATTERN = /^(#{1,})(?:\s+(.*)|(\S.*))$/;

export function markdownHeadingToIndentedLine(line: string): string | null {
  const headingMatch = line.match(MARKDOWN_HEADING_PATTERN);
  if (!headingMatch) return null;

  const level = Math.min(headingMatch[1].length, MAX_LEVEL);
  const content = headingMatch[2] ?? headingMatch[3] ?? "";
  const indent = "  ".repeat(level - 1);

  return `${indent}${content}`;
}

export function indentToLevel(spaces: number): number {
  const level = Math.floor(spaces / 2) + 1;
  return Math.min(level, MAX_LEVEL);
}

export function indentedTextToMarkdown(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    // Preserve empty lines as-is
    if (line.trim() === "") {
      result.push("");
      continue;
    }

    // Count leading spaces
    const match = line.match(/^( *)/);
    const spaces = match ? match[1].length : 0;
    const content = line.slice(spaces);

    const level = indentToLevel(spaces);
    const hashes = "#".repeat(level);

    result.push(`${hashes} ${content}`);
  }

  return result.join("\n");
}

/**
 * Convert markdown with heading syntax back to indented plain text.
 * Used for migrating existing documents on load.
 */
export function markdownToIndentedText(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    result.push(markdownHeadingToIndentedLine(line) ?? line);
  }

  return result.join("\n");
}
