import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

export interface EditorStyleTokens {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  paddingInline: string;
  paddingBlockStart: string;
  paddingBlockEnd: string;
  contentMaxWidth: string;
  gutterOpacity: string;
  activeLineBg: string;
  selectionBg: string;
  selectionFocusBg: string;
}

export interface EditorStyleEntry {
  id: string;
  label: string;
  extension: Extension;
  tokens: EditorStyleTokens;
}

const sharedLayout = EditorView.theme({
  ".cm-scroller": {
    fontFamily: "var(--editor-font-family)",
    lineHeight: "var(--editor-line-height)",
    padding: "var(--editor-padding-block-start) var(--editor-padding-inline) var(--editor-padding-block-end)",
  },
  ".cm-content": {
    width: "min(100%, var(--editor-content-max-width))",
    margin: "0 auto",
    letterSpacing: "var(--editor-letter-spacing)",
  },
  ".cm-gutters": {
    paddingTop: "var(--editor-padding-block-start)",
    opacity: "var(--editor-gutter-opacity)",
  },
});

const defaultStyle = EditorView.theme({});

const tufteHighlightStyle = HighlightStyle.define([
  { tag: t.heading, color: "var(--fg)", fontWeight: "600", letterSpacing: "-0.01em" },
  { tag: [t.meta, t.comment], color: "var(--fg-dim)", fontStyle: "italic" },
  { tag: [t.keyword, t.operator, t.operatorKeyword], color: "var(--fg-secondary)" },
  { tag: [t.link, t.url], color: "var(--accent)", textDecoration: "underline" },
  { tag: [t.string, t.number, t.bool, t.atom], color: "var(--fg)" },
]);

const tufteStyle = EditorView.theme({
  ".cm-content": {
    textRendering: "optimizeLegibility",
    fontVariantLigatures: "common-ligatures oldstyle-nums",
  },
});

export const EDITOR_STYLES: EditorStyleEntry[] = [
  {
    id: "default",
    label: "Default",
    extension: [sharedLayout, defaultStyle],
    tokens: {
      fontFamily: "var(--mono-font)",
      fontSize: "13.5px",
      lineHeight: "1.75",
      letterSpacing: "0",
      paddingInline: "20px",
      paddingBlockStart: "24px",
      paddingBlockEnd: "72px",
      contentMaxWidth: "100%",
      gutterOpacity: "1",
      activeLineBg: "var(--accent-dim)",
      selectionBg: "color-mix(in srgb, var(--accent) 14%, transparent)",
      selectionFocusBg: "color-mix(in srgb, var(--accent) 20%, transparent)",
    },
  },
  {
    id: "tufte",
    label: "Tufte",
    extension: [sharedLayout, tufteStyle, syntaxHighlighting(tufteHighlightStyle)],
    tokens: {
      fontFamily: '"Iowan Old Style", "Baskerville", Georgia, serif',
      fontSize: "16px",
      lineHeight: "1.95",
      letterSpacing: "0.012em",
      paddingInline: "36px",
      paddingBlockStart: "36px",
      paddingBlockEnd: "96px",
      contentMaxWidth: "62ch",
      gutterOpacity: "0.45",
      activeLineBg: "color-mix(in srgb, var(--accent) 5%, transparent)",
      selectionBg: "color-mix(in srgb, var(--accent) 10%, transparent)",
      selectionFocusBg: "color-mix(in srgb, var(--accent) 16%, transparent)",
    },
  },
];

export function getEditorStyleById(id: string): EditorStyleEntry | undefined {
  return EDITOR_STYLES.find((style) => style.id === id);
}

export function applyEditorStyleTokens(tokens: EditorStyleTokens): void {
  const style = document.documentElement.style;
  style.setProperty("--editor-font-family", tokens.fontFamily);
  style.setProperty("--editor-font-size", tokens.fontSize);
  style.setProperty("--editor-line-height", tokens.lineHeight);
  style.setProperty("--editor-letter-spacing", tokens.letterSpacing);
  style.setProperty("--editor-padding-inline", tokens.paddingInline);
  style.setProperty("--editor-padding-block-start", tokens.paddingBlockStart);
  style.setProperty("--editor-padding-block-end", tokens.paddingBlockEnd);
  style.setProperty("--editor-content-max-width", tokens.contentMaxWidth);
  style.setProperty("--editor-gutter-opacity", tokens.gutterOpacity);
  style.setProperty("--editor-active-line-bg", tokens.activeLineBg);
  style.setProperty("--editor-selection-bg", tokens.selectionBg);
  style.setProperty("--editor-selection-focus-bg", tokens.selectionFocusBg);
}
