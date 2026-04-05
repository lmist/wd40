import { describe, it, expect } from "vitest";
import { EDITOR_STYLES, applyEditorStyleTokens, getEditorStyleById } from "./editor-styles";

describe("getEditorStyleById", () => {
  it("returns the tufte style for a valid id", () => {
    const style = getEditorStyleById("tufte");
    expect(style).toBeDefined();
    expect(style!.label).toBe("Tufte");
  });

  it("returns undefined for an invalid id", () => {
    expect(getEditorStyleById("lisbon")).toBeUndefined();
  });
});

describe("applyEditorStyleTokens", () => {
  it("sets editor style CSS custom properties", () => {
    applyEditorStyleTokens(EDITOR_STYLES[1].tokens);

    const style = document.documentElement.style;
    expect(style.getPropertyValue("--editor-font-family")).toBe(EDITOR_STYLES[1].tokens.fontFamily);
    expect(style.getPropertyValue("--editor-font-size")).toBe(EDITOR_STYLES[1].tokens.fontSize);
    expect(style.getPropertyValue("--editor-content-max-width")).toBe(EDITOR_STYLES[1].tokens.contentMaxWidth);
    expect(style.getPropertyValue("--editor-selection-focus-bg")).toBe(EDITOR_STYLES[1].tokens.selectionFocusBg);
  });
});
