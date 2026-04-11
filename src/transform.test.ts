import { describe, it, expect } from "vitest";
import { indentedTextToMarkdown, markdownToIndentedText, indentToLevel } from "./transform";

describe("indentToLevel", () => {
  it("maps 0 spaces to level 1", () => {
    expect(indentToLevel(0)).toBe(1);
  });

  it("maps 2 spaces to level 2", () => {
    expect(indentToLevel(2)).toBe(2);
  });

  it("maps 4 spaces to level 3", () => {
    expect(indentToLevel(3)).toBe(2); // floor(3/2)+1 = 2
    expect(indentToLevel(4)).toBe(3);
  });

  it("maps 10 spaces to level 6", () => {
    expect(indentToLevel(10)).toBe(6);
  });

  it("clamps at level 6 for 12+ spaces", () => {
    expect(indentToLevel(12)).toBe(6);
    expect(indentToLevel(20)).toBe(6);
    expect(indentToLevel(100)).toBe(6);
  });

  it("handles odd space counts by flooring", () => {
    expect(indentToLevel(1)).toBe(1); // floor(1/2)+1 = 1
    expect(indentToLevel(3)).toBe(2); // floor(3/2)+1 = 2
    expect(indentToLevel(5)).toBe(3); // floor(5/2)+1 = 3
  });
});

describe("indentedTextToMarkdown", () => {
  it("converts level-1 text to H1", () => {
    expect(indentedTextToMarkdown("Hello")).toBe("# Hello");
  });

  it("converts indented text to headings", () => {
    const input = "Marketing\n  Website\n  SEO\nEngineering";
    const expected = "# Marketing\n## Website\n## SEO\n# Engineering";
    expect(indentedTextToMarkdown(input)).toBe(expected);
  });

  it("handles deep nesting up to 6 levels", () => {
    const input = [
      "Level 1",
      "  Level 2",
      "    Level 3",
      "      Level 4",
      "        Level 5",
      "          Level 6",
    ].join("\n");
    const expected = [
      "# Level 1",
      "## Level 2",
      "### Level 3",
      "#### Level 4",
      "##### Level 5",
      "###### Level 6",
    ].join("\n");
    expect(indentedTextToMarkdown(input)).toBe(expected);
  });

  it("clamps beyond 6 levels to H6", () => {
    const input = "            Way too deep";
    expect(indentedTextToMarkdown(input)).toBe("###### Way too deep");
  });

  it("preserves empty lines", () => {
    const input = "First\n\nSecond";
    const expected = "# First\n\n# Second";
    expect(indentedTextToMarkdown(input)).toBe(expected);
  });

  it("handles trailing newline", () => {
    const input = "Hello\n";
    const expected = "# Hello\n";
    expect(indentedTextToMarkdown(input)).toBe(expected);
  });

  it("handles empty input", () => {
    expect(indentedTextToMarkdown("")).toBe("");
  });

  it("handles single empty line", () => {
    expect(indentedTextToMarkdown("\n")).toBe("\n");
  });

  it("handles mixed content with multiple empty lines", () => {
    const input = "A\n\n\n  B";
    const expected = "# A\n\n\n## B";
    expect(indentedTextToMarkdown(input)).toBe(expected);
  });
});

describe("markdownToIndentedText", () => {
  it("converts H1 to level 1 (no indent)", () => {
    expect(markdownToIndentedText("# Hello")).toBe("Hello");
  });

  it("accepts headings without a space after the hashes", () => {
    const input = "#Oslo\n####Quito";
    const expected = "Oslo\n      Quito";
    expect(markdownToIndentedText(input)).toBe(expected);
  });

  it("converts heading hierarchy to indentation", () => {
    const input = "# Marketing\n## Website\n## SEO\n# Engineering";
    const expected = "Marketing\n  Website\n  SEO\nEngineering";
    expect(markdownToIndentedText(input)).toBe(expected);
  });

  it("preserves empty lines", () => {
    const input = "# First\n\n# Second";
    const expected = "First\n\nSecond";
    expect(markdownToIndentedText(input)).toBe(expected);
  });

  it("handles all 6 heading levels", () => {
    const input = "# L1\n## L2\n### L3\n#### L4\n##### L5\n###### L6";
    const expected = "L1\n  L2\n    L3\n      L4\n        L5\n          L6";
    expect(markdownToIndentedText(input)).toBe(expected);
  });

  it("passes through non-heading lines unchanged", () => {
    const input = "# Heading\nJust some text\n## Sub";
    const expected = "Heading\nJust some text\n  Sub";
    expect(markdownToIndentedText(input)).toBe(expected);
  });

  it("roundtrips: markdown → indented → markdown", () => {
    const md = "# A\n## B\n### C\n## D\n# E";
    expect(indentedTextToMarkdown(markdownToIndentedText(md))).toBe(md);
  });

  it("normalizes no-space markdown headings on roundtrip", () => {
    const md = "#Oslo\n####Quito";
    expect(indentedTextToMarkdown(markdownToIndentedText(md))).toBe("# Oslo\n#### Quito");
  });

  it("roundtrips: indented → markdown → indented", () => {
    const indented = "A\n  B\n    C\n  D\nE";
    expect(markdownToIndentedText(indentedTextToMarkdown(indented))).toBe(indented);
  });
});
