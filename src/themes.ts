import { Extension } from "@codemirror/state";
import { oneDark, oneLight, oneDusk, DARK_BRANCH_COLORS, LIGHT_BRANCH_COLORS, DUSK_BRANCH_COLORS } from "./theme";

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
  modeNormalBg: string;
  modeNormalFg: string;
  modeInsertBg: string;
  modeInsertFg: string;
  modeVisualBg: string;
  modeVisualFg: string;
}

export interface ThemeEntry {
  id: string;
  label: string;
  isDark: boolean;
  extension: Extension;
  chrome: ChromeColors;
  branchColors: string[];
}

export const THEMES: ThemeEntry[] = [
  {
    id: "wd40-dark",
    label: "Dark",
    isDark: true,
    extension: oneDark,
    chrome: {
      bg: "#1c1c1e",
      bgSurface: "#2c2c2e",
      bgEditor: "#1c1c1e",
      fg: "#f5f5f7",
      fgDim: "#48484a",
      fgSecondary: "#8e8e93",
      accent: "#0A84FF",
      accentDim: "rgba(10, 132, 255, 0.10)",
      accentHover: "rgba(10, 132, 255, 0.18)",
      accentSecondary: "#64D2FF",
      border: "rgba(255, 255, 255, 0.08)",
      statusbarBg: "#1c1c1e",
      toolbarBg: "rgba(44, 44, 46, 0.88)",
      toolbarBorder: "rgba(255, 255, 255, 0.08)",
      modeBg: "rgba(10, 132, 255, 0.12)",
      modeFg: "#0A84FF",
      modeNormalBg: "rgba(10, 132, 255, 0.12)",
      modeNormalFg: "#0A84FF",
      modeInsertBg: "rgba(48, 209, 88, 0.12)",
      modeInsertFg: "#30D158",
      modeVisualBg: "rgba(191, 90, 242, 0.12)",
      modeVisualFg: "#BF5AF2",
    },
    branchColors: DARK_BRANCH_COLORS,
  },
  {
    id: "wd40-light",
    label: "Light",
    isDark: false,
    extension: oneLight,
    chrome: {
      bg: "#f2f2f7",
      bgSurface: "#ffffff",
      bgEditor: "#ffffff",
      fg: "#1c1c1e",
      fgDim: "#aeaeb2",
      fgSecondary: "#8e8e93",
      accent: "#007AFF",
      accentDim: "rgba(0, 122, 255, 0.08)",
      accentHover: "rgba(0, 122, 255, 0.14)",
      accentSecondary: "#5AC8FA",
      border: "rgba(60, 60, 67, 0.12)",
      statusbarBg: "#f2f2f7",
      toolbarBg: "rgba(255, 255, 255, 0.92)",
      toolbarBorder: "rgba(60, 60, 67, 0.10)",
      modeBg: "rgba(0, 122, 255, 0.08)",
      modeFg: "#007AFF",
      modeNormalBg: "rgba(0, 122, 255, 0.08)",
      modeNormalFg: "#007AFF",
      modeInsertBg: "rgba(52, 199, 89, 0.10)",
      modeInsertFg: "#34C759",
      modeVisualBg: "rgba(175, 82, 222, 0.10)",
      modeVisualFg: "#AF52DE",
    },
    branchColors: LIGHT_BRANCH_COLORS,
  },
  {
    id: "wd40-dusk",
    label: "Dusk",
    isDark: true,
    extension: oneDusk,
    chrome: {
      bg: "#2c2c2e",
      bgSurface: "#3a3a3c",
      bgEditor: "#2c2c2e",
      fg: "#e5e5ea",
      fgDim: "#48484a",
      fgSecondary: "#8e8e93",
      accent: "#0A84FF",
      accentDim: "rgba(10, 132, 255, 0.10)",
      accentHover: "rgba(10, 132, 255, 0.18)",
      accentSecondary: "#64D2FF",
      border: "rgba(255, 255, 255, 0.08)",
      statusbarBg: "#2c2c2e",
      toolbarBg: "rgba(58, 58, 60, 0.90)",
      toolbarBorder: "rgba(255, 255, 255, 0.08)",
      modeBg: "rgba(10, 132, 255, 0.12)",
      modeFg: "#0A84FF",
      modeNormalBg: "rgba(10, 132, 255, 0.12)",
      modeNormalFg: "#0A84FF",
      modeInsertBg: "rgba(48, 209, 88, 0.12)",
      modeInsertFg: "#30D158",
      modeVisualBg: "rgba(191, 90, 242, 0.12)",
      modeVisualFg: "#BF5AF2",
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
  s.setProperty("--mode-normal-bg", chrome.modeNormalBg);
  s.setProperty("--mode-normal-fg", chrome.modeNormalFg);
  s.setProperty("--mode-insert-bg", chrome.modeInsertBg);
  s.setProperty("--mode-insert-fg", chrome.modeInsertFg);
  s.setProperty("--mode-visual-bg", chrome.modeVisualBg);
  s.setProperty("--mode-visual-fg", chrome.modeVisualFg);
}
