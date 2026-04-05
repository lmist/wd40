import { Extension } from "@codemirror/state";
import { oneDark, oneLight, oneDusk, LIGHT_BRANCH_COLORS, DUSK_BRANCH_COLORS } from "./theme";

export interface ChromeColors {
  bg: string;
  bgSurface: string;
  bgEditor: string;
  fg: string;
  fgDim: string;
  fgSecondary: string;
  accent: string;
  accentDim: string;
  accentHover: string;
  accentSecondary: string;
  border: string;
  statusbarBg: string;
  toolbarBg: string;
  toolbarBorder: string;
  modeBg: string;
  modeFg: string;
}

export interface ThemeEntry {
  id: string;
  label: string;
  isDark: boolean;
  extension: Extension;
  chrome: ChromeColors;
  branchColors: string[];
}

const DARK_BRANCHES = [
  "#e09050", "#8cc265", "#6bafbd", "#c49be0",
  "#e0b854", "#e06868", "#5cb8c8", "#e08890",
];

export const THEMES: ThemeEntry[] = [
  {
    id: "wd40-dark",
    label: "wd40 Dark",
    isDark: true,
    extension: oneDark,
    chrome: {
      bg: "#1a1a1c",
      bgSurface: "#202022",
      bgEditor: "#17171a",
      fg: "#e8e6e3",
      fgDim: "#555553",
      fgSecondary: "#8a8a88",
      accent: "#e09050",
      accentDim: "rgba(224, 144, 80, 0.10)",
      accentHover: "rgba(224, 144, 80, 0.18)",
      accentSecondary: "#6bafbd",
      border: "rgba(255, 255, 255, 0.07)",
      statusbarBg: "#17171a",
      toolbarBg: "rgba(32, 32, 34, 0.88)",
      toolbarBorder: "rgba(255, 255, 255, 0.08)",
      modeBg: "rgba(224, 144, 80, 0.10)",
      modeFg: "#e09050",
    },
    branchColors: DARK_BRANCHES,
  },
  {
    id: "wd40-light",
    label: "wd40 Light",
    isDark: false,
    extension: oneLight,
    chrome: {
      bg: "#f5f4f1",
      bgSurface: "#f0efec",
      bgEditor: "#fdfcfa",
      fg: "#1a1a1a",
      fgDim: "#a8a8a6",
      fgSecondary: "#6e6e6c",
      accent: "#c4652a",
      accentDim: "rgba(196, 101, 42, 0.07)",
      accentHover: "rgba(196, 101, 42, 0.14)",
      accentSecondary: "#2878a8",
      border: "rgba(0, 0, 0, 0.07)",
      statusbarBg: "#eae9e5",
      toolbarBg: "rgba(250, 249, 247, 0.92)",
      toolbarBorder: "rgba(0, 0, 0, 0.06)",
      modeBg: "rgba(196, 101, 42, 0.08)",
      modeFg: "#c4652a",
    },
    branchColors: LIGHT_BRANCH_COLORS,
  },
  {
    id: "wd40-dusk",
    label: "wd40 Dusk",
    isDark: true,
    extension: oneDusk,
    chrome: {
      bg: "#2d2b28",
      bgSurface: "#343230",
      bgEditor: "#252320",
      fg: "#d8d2c8",
      fgDim: "#6e6a62",
      fgSecondary: "#9a9590",
      accent: "#d4a054",
      accentDim: "rgba(212, 160, 84, 0.12)",
      accentHover: "rgba(212, 160, 84, 0.20)",
      accentSecondary: "#6ba8c0",
      border: "rgba(255, 240, 220, 0.08)",
      statusbarBg: "#252320",
      toolbarBg: "rgba(45, 43, 40, 0.90)",
      toolbarBorder: "rgba(255, 240, 220, 0.08)",
      modeBg: "rgba(212, 160, 84, 0.12)",
      modeFg: "#d4a054",
    },
    branchColors: DUSK_BRANCH_COLORS,
  },
];

export function getThemeById(id: string): ThemeEntry | undefined {
  return THEMES.find((t) => t.id === id);
}

export function applyChromeColors(chrome: ChromeColors): void {
  const s = document.documentElement.style;
  s.setProperty("--bg", chrome.bg);
  s.setProperty("--bg-surface", chrome.bgSurface);
  s.setProperty("--bg-editor", chrome.bgEditor);
  s.setProperty("--fg", chrome.fg);
  s.setProperty("--fg-dim", chrome.fgDim);
  s.setProperty("--fg-secondary", chrome.fgSecondary);
  s.setProperty("--accent", chrome.accent);
  s.setProperty("--accent-dim", chrome.accentDim);
  s.setProperty("--accent-hover", chrome.accentHover);
  s.setProperty("--accent-secondary", chrome.accentSecondary);
  s.setProperty("--border", chrome.border);
  s.setProperty("--statusbar-bg", chrome.statusbarBg);
  s.setProperty("--toolbar-bg", chrome.toolbarBg);
  s.setProperty("--toolbar-border", chrome.toolbarBorder);
  s.setProperty("--mode-bg", chrome.modeBg);
  s.setProperty("--mode-fg", chrome.modeFg);
}
