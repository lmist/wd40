import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// --- Dark theme — Apple HIG (Cupertino Dark) ---
const blue = "#0A84FF",
  purple = "#BF5AF2",
  cyan = "#64D2FF",
  green = "#30D158",
  orange = "#FF9F0A",
  yellow = "#FFD60A",
  red = "#FF453A",
  fg = "#f5f5f7",
  comment = "#636366",
  bg = "#1c1c1e",
  surface = "#2c2c2e",
  border = "rgba(255, 255, 255, 0.08)";

const darkTheme = EditorView.theme(
  {
    "&": { color: fg, backgroundColor: bg },
    ".cm-content": { caretColor: blue },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: blue },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(10, 132, 255, 0.20)" },
    ".cm-panels": { backgroundColor: bg, color: fg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${border}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${border}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(10, 132, 255, 0.15)",
      outline: "1px solid rgba(10, 132, 255, 0.30)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(10, 132, 255, 0.30)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(10, 132, 255, 0.06)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(10, 132, 255, 0.10)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(10, 132, 255, 0.22)",
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
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(10, 132, 255, 0.15)" },
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
  { tag: t.heading, fontWeight: "bold", color: "#f5f5f7" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: orange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: green },
  { tag: t.invalid, color: red },
]);

export const oneDark: Extension = [darkTheme, syntaxHighlighting(darkHighlightStyle)];

// --- Light theme — Apple HIG (Cupertino Light) ---
const lBlue = "#007AFF",
  lPurple = "#AF52DE",
  lCyan = "#5AC8FA",
  lGreen = "#34C759",
  lOrange = "#FF9500",
  lYellow = "#FF9500",
  lRed = "#FF3B30",
  lFg = "#1c1c1e",
  lComment = "#8e8e93",
  lBg = "#ffffff",
  lSurface = "#f2f2f7",
  lBorder = "rgba(60, 60, 67, 0.12)";

const lightTheme = EditorView.theme(
  {
    "&": { color: lFg, backgroundColor: lBg },
    ".cm-content": { caretColor: lBlue },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: lBlue },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(0, 122, 255, 0.16)" },
    ".cm-panels": { backgroundColor: lBg, color: lFg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${lBorder}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${lBorder}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(0, 122, 255, 0.12)",
      outline: "1px solid rgba(0, 122, 255, 0.30)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(0, 122, 255, 0.25)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(0, 122, 255, 0.05)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(0, 122, 255, 0.08)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(0, 122, 255, 0.18)",
    },
    ".cm-gutters": {
      backgroundColor: lBg,
      color: lComment,
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent" },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: lComment,
    },
    ".cm-tooltip": {
      border: `1px solid ${lBorder}`,
      backgroundColor: lSurface,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": { borderTopColor: "transparent", borderBottomColor: "transparent" },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: lSurface,
      borderBottomColor: lSurface,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(0, 122, 255, 0.12)" },
    },
  },
  { dark: false }
);

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: lPurple },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: lRed },
  { tag: [t.function(t.variableName), t.labelName], color: lBlue },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: lOrange },
  { tag: [t.definition(t.name), t.separator], color: lFg },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: lYellow },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: lCyan },
  { tag: [t.meta, t.comment], color: lComment },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: lBlue, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: lFg },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: lOrange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: lGreen },
  { tag: t.invalid, color: lRed },
]);

export const oneLight: Extension = [lightTheme, syntaxHighlighting(lightHighlightStyle)];

// --- Dusk theme — Apple HIG (Cupertino Dusk) ---
const dBlue = "#0A84FF",
  dPurple = "#BF5AF2",
  dCyan = "#64D2FF",
  dGreen = "#30D158",
  dOrange = "#FF9F0A",
  dYellow = "#FFD60A",
  dRed = "#FF453A",
  dFg = "#e5e5ea",
  dComment = "#636366",
  dBg = "#2c2c2e",
  dSurface = "#3a3a3c",
  dBorder = "rgba(255, 255, 255, 0.08)";

const duskTheme = EditorView.theme(
  {
    "&": { color: dFg, backgroundColor: dBg },
    ".cm-content": { caretColor: dBlue },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: dBlue },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(10, 132, 255, 0.20)" },
    ".cm-panels": { backgroundColor: dBg, color: dFg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${dBorder}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${dBorder}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(10, 132, 255, 0.15)",
      outline: "1px solid rgba(10, 132, 255, 0.30)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(10, 132, 255, 0.30)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(10, 132, 255, 0.06)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(10, 132, 255, 0.10)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(10, 132, 255, 0.22)",
    },
    ".cm-gutters": {
      backgroundColor: dBg,
      color: dComment,
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent" },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: dComment,
    },
    ".cm-tooltip": {
      border: `1px solid ${dBorder}`,
      backgroundColor: dSurface,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": { borderTopColor: "transparent", borderBottomColor: "transparent" },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: dSurface,
      borderBottomColor: dSurface,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(10, 132, 255, 0.15)" },
    },
  },
  { dark: true }
);

const duskHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: dPurple },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: dRed },
  { tag: [t.function(t.variableName), t.labelName], color: dBlue },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: dOrange },
  { tag: [t.definition(t.name), t.separator], color: dFg },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: dYellow },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: dCyan },
  { tag: [t.meta, t.comment], color: dComment },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: dCyan, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#e5e5ea" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: dOrange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: dGreen },
  { tag: t.invalid, color: dRed },
]);

export const oneDusk: Extension = [duskTheme, syntaxHighlighting(duskHighlightStyle)];

// Apple system colors — dark mode variants
export const DARK_BRANCH_COLORS = [
  "#0A84FF", // systemBlue
  "#30D158", // systemGreen
  "#5E5CE6", // systemIndigo
  "#FF9F0A", // systemOrange
  "#FF375F", // systemPink
  "#BF5AF2", // systemPurple
  "#64D2FF", // systemTeal
  "#FFD60A", // systemYellow
];

// Apple system colors — dusk (same as dark, slightly muted)
export const DUSK_BRANCH_COLORS = [
  "#0A84FF", // systemBlue
  "#30D158", // systemGreen
  "#5E5CE6", // systemIndigo
  "#FF9F0A", // systemOrange
  "#FF375F", // systemPink
  "#BF5AF2", // systemPurple
  "#64D2FF", // systemTeal
  "#FFD60A", // systemYellow
];

// Apple system colors — light mode variants
export const LIGHT_BRANCH_COLORS = [
  "#007AFF", // systemBlue
  "#34C759", // systemGreen
  "#5856D6", // systemIndigo
  "#FF9500", // systemOrange
  "#FF2D55", // systemPink
  "#AF52DE", // systemPurple
  "#5AC8FA", // systemTeal
  "#FFCC00", // systemYellow
];
