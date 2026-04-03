import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Tokyo Night palette
const blue = "#7aa2f7",
  purple = "#bb9af7",
  cyan = "#7dcfff",
  green = "#9ece6a",
  orange = "#ff9e64",
  yellow = "#e0af68",
  red = "#f7768e",
  fg = "#c0caf5",
  comment = "#565f89",
  bg = "#13131a",
  surface = "#1a1b26",
  border = "#1f2335";

const darkTheme = EditorView.theme(
  {
    "&": { color: fg, backgroundColor: bg },
    ".cm-content": { caretColor: blue },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: blue },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(122, 162, 247, 0.18)" },
    ".cm-panels": { backgroundColor: bg, color: fg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${border}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${border}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(122, 162, 247, 0.12)",
      outline: "1px solid rgba(122, 162, 247, 0.25)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(122, 162, 247, 0.25)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(122, 162, 247, 0.06)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(122, 162, 247, 0.08)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(122, 162, 247, 0.18)",
    },
    ".cm-gutters": {
      backgroundColor: bg,
      color: comment,
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent" },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: comment,
    },
    ".cm-tooltip": {
      border: `1px solid ${border}`,
      backgroundColor: surface,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": { borderTopColor: "transparent", borderBottomColor: "transparent" },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: surface,
      borderBottomColor: surface,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(122, 162, 247, 0.12)" },
    },
  },
  { dark: true }
);

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: purple },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: red },
  { tag: [t.function(t.variableName), t.labelName], color: blue },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: orange },
  { tag: [t.definition(t.name), t.separator], color: fg },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: yellow },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: cyan },
  { tag: [t.meta, t.comment], color: comment },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: cyan, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: blue },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: orange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: green },
  { tag: t.invalid, color: red },
]);

export const oneDark: Extension = [darkTheme, syntaxHighlighting(darkHighlightStyle)];
