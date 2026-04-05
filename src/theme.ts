import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Warm dark palette — richer, more saturated
const blue = "#6bafbd",
  purple = "#c49be0",
  cyan = "#5cb8c8",
  green = "#8cc265",
  orange = "#e09050",
  yellow = "#e0b854",
  red = "#e06868",
  fg = "#e8e6e3",
  comment = "#6a6a68",
  bg = "#17171a",
  surface = "#1a1a1c",
  border = "rgba(255, 255, 255, 0.07)";

const darkTheme = EditorView.theme(
  {
    "&": { color: fg, backgroundColor: bg },
    ".cm-content": { caretColor: orange },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: orange },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(224, 144, 80, 0.16)" },
    ".cm-panels": { backgroundColor: bg, color: fg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${border}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${border}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(224, 144, 80, 0.12)",
      outline: "1px solid rgba(224, 144, 80, 0.25)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(224, 144, 80, 0.25)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(224, 144, 80, 0.06)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(224, 144, 80, 0.08)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(224, 144, 80, 0.18)",
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
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(224, 144, 80, 0.12)" },
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
  { tag: t.heading, fontWeight: "bold", color: yellow },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: orange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: green },
  { tag: t.invalid, color: red },
]);

export const oneDark: Extension = [darkTheme, syntaxHighlighting(darkHighlightStyle)];

// --- Light theme (warm paper, richer tones) ---
const lBlue = "#2878a8",
  lPurple = "#7847bd",
  lCyan = "#1a7a8a",
  lGreen = "#4a8030",
  lOrange = "#c4652a",
  lYellow = "#9a7028",
  lRed = "#c4453a",
  lFg = "#1a1a1a",
  lComment = "#a0a09e",
  lBg = "#fdfcfa",
  lSurface = "#f5f4f1",
  lBorder = "rgba(0, 0, 0, 0.07)";

const lightTheme = EditorView.theme(
  {
    "&": { color: lFg, backgroundColor: lBg },
    ".cm-content": { caretColor: lOrange },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: lOrange },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(196, 101, 42, 0.14)" },
    ".cm-panels": { backgroundColor: lBg, color: lFg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${lBorder}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${lBorder}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(196, 101, 42, 0.10)",
      outline: "1px solid rgba(196, 101, 42, 0.25)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(196, 101, 42, 0.20)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(196, 101, 42, 0.05)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(196, 101, 42, 0.08)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(196, 101, 42, 0.15)",
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
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(196, 101, 42, 0.10)" },
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
  { tag: t.link, color: lCyan, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: lYellow },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: lOrange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: lGreen },
  { tag: t.invalid, color: lRed },
]);

export const oneLight: Extension = [lightTheme, syntaxHighlighting(lightHighlightStyle)];

// --- Dusk theme (warm mid-tone, golden hour) ---
const dBlue = "#6ba8c0",
  dPurple = "#b890d0",
  dCyan = "#5aada8",
  dGreen = "#8ab860",
  dOrange = "#d4a054",
  dYellow = "#c8b050",
  dRed = "#d07060",
  dFg = "#d8d2c8",
  dComment = "#706860",
  dBg = "#252320",
  dSurface = "#2d2b28",
  dBorder = "rgba(255, 240, 220, 0.08)";

const duskTheme = EditorView.theme(
  {
    "&": { color: dFg, backgroundColor: dBg },
    ".cm-content": { caretColor: dOrange },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: dOrange },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(212, 160, 84, 0.16)" },
    ".cm-panels": { backgroundColor: dBg, color: dFg },
    ".cm-panels.cm-panels-top": { borderBottom: `1px solid ${dBorder}` },
    ".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${dBorder}` },
    ".cm-searchMatch": {
      backgroundColor: "rgba(212, 160, 84, 0.12)",
      outline: "1px solid rgba(212, 160, 84, 0.25)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(212, 160, 84, 0.25)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(212, 160, 84, 0.06)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(212, 160, 84, 0.08)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(212, 160, 84, 0.18)",
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
      "& > ul > li[aria-selected]": { backgroundColor: "rgba(212, 160, 84, 0.12)" },
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
  { tag: t.heading, fontWeight: "bold", color: dYellow },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: dOrange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: dGreen },
  { tag: t.invalid, color: dRed },
]);

export const oneDusk: Extension = [duskTheme, syntaxHighlighting(duskHighlightStyle)];

export const DUSK_BRANCH_COLORS = [
  "#d4a054", // golden amber
  "#8ab860", // sage green
  "#6ba8c0", // dusty blue
  "#b890d0", // lavender
  "#5aada8", // muted teal
  "#d07060", // terracotta
  "#c8b050", // warm gold
  "#b06890", // rose
];

// Light branch colors (saturated, distinct)
export const LIGHT_BRANCH_COLORS = [
  "#c4652a", // burnt sienna
  "#4a8030", // forest green
  "#2878a8", // ocean blue
  "#7847bd", // purple
  "#1a7a8a", // teal
  "#c4453a", // warm red
  "#9a7028", // gold
  "#b05098", // magenta
];
