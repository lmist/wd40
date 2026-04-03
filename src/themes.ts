import { Extension } from "@codemirror/state";
import { oneDark, oneLight, LIGHT_BRANCH_COLORS } from "./theme";

// --- Third-party themes ---
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { nord } from "@uiw/codemirror-theme-nord";
import { solarizedDark, solarizedLight } from "@uiw/codemirror-theme-solarized";
import { gruvboxDark, gruvboxLight } from "@uiw/codemirror-theme-gruvbox-dark";
import { materialDark, materialLight } from "@uiw/codemirror-theme-material";
import { sublime } from "@uiw/codemirror-theme-sublime";
import { andromeda } from "@uiw/codemirror-theme-andromeda";
import { aura } from "@uiw/codemirror-theme-aura";
import { copilot } from "@uiw/codemirror-theme-copilot";
import { quietlight } from "@uiw/codemirror-theme-quietlight";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-theme-xcode";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { tokyoNightDay } from "@uiw/codemirror-theme-tokyo-night-day";

export interface ChromeColors {
  bg: string;
  bgSurface: string;
  bgEditor: string;
  fg: string;
  fgDim: string;
  accent: string;
  accentDim: string;
  border: string;
  statusbarBg: string;
}

export interface ThemeEntry {
  id: string;
  label: string;
  isDark: boolean;
  extension: Extension;
  chrome: ChromeColors;
  branchColors: string[];
}

// --- Branch color palettes ---
const DARK_BRANCHES = [
  "#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7",
  "#7dcfff", "#f7768e", "#73daca", "#ff9e64",
];

const LIGHT_BRANCHES = LIGHT_BRANCH_COLORS;

export const THEMES: ThemeEntry[] = [
  // ── Custom Tokyo Night (default) ──
  {
    id: "tokyo-night-custom",
    label: "Tokyo Night",
    isDark: true,
    extension: oneDark,
    chrome: {
      bg: "#1a1b26", bgSurface: "#16161e", bgEditor: "#13131a",
      fg: "#c0caf5", fgDim: "#565f89", accent: "#7aa2f7",
      accentDim: "rgba(122, 162, 247, 0.15)", border: "#1f2335",
      statusbarBg: "#13131a",
    },
    branchColors: DARK_BRANCHES,
  },
  {
    id: "tokyo-night-day-custom",
    label: "Tokyo Night Day",
    isDark: false,
    extension: oneLight,
    chrome: {
      bg: "#f0f0f3", bgSurface: "#fafafa", bgEditor: "#ffffff",
      fg: "#343b58", fgDim: "#9699a3", accent: "#2e7de9",
      accentDim: "rgba(46, 125, 233, 0.1)", border: "#d8dae5",
      statusbarBg: "#e8e8ec",
    },
    branchColors: LIGHT_BRANCHES,
  },

  // ── Dark themes ──
  {
    id: "dracula",
    label: "Dracula",
    isDark: true,
    extension: dracula,
    chrome: {
      bg: "#282a36", bgSurface: "#21222c", bgEditor: "#282a36",
      fg: "#f8f8f2", fgDim: "#6272a4", accent: "#bd93f9",
      accentDim: "rgba(189, 147, 249, 0.15)", border: "#44475a",
      statusbarBg: "#21222c",
    },
    branchColors: ["#bd93f9", "#50fa7b", "#f1fa8c", "#ff79c6", "#8be9fd", "#ffb86c", "#ff5555", "#6272a4"],
  },
  {
    id: "monokai",
    label: "Monokai",
    isDark: true,
    extension: monokai,
    chrome: {
      bg: "#272822", bgSurface: "#1e1f1c", bgEditor: "#272822",
      fg: "#f8f8f2", fgDim: "#75715e", accent: "#a6e22e",
      accentDim: "rgba(166, 226, 46, 0.12)", border: "#3e3d32",
      statusbarBg: "#1e1f1c",
    },
    branchColors: ["#a6e22e", "#66d9ef", "#f92672", "#fd971f", "#e6db74", "#ae81ff", "#a1efe4", "#f8f8f2"],
  },
  {
    id: "nord",
    label: "Nord",
    isDark: true,
    extension: nord,
    chrome: {
      bg: "#2e3440", bgSurface: "#272c36", bgEditor: "#2e3440",
      fg: "#d8dee9", fgDim: "#4c566a", accent: "#88c0d0",
      accentDim: "rgba(136, 192, 208, 0.12)", border: "#3b4252",
      statusbarBg: "#272c36",
    },
    branchColors: ["#88c0d0", "#a3be8c", "#ebcb8b", "#b48ead", "#81a1c1", "#bf616a", "#d08770", "#5e81ac"],
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    isDark: true,
    extension: githubDark,
    chrome: {
      bg: "#0d1117", bgSurface: "#010409", bgEditor: "#0d1117",
      fg: "#e6edf3", fgDim: "#7d8590", accent: "#58a6ff",
      accentDim: "rgba(88, 166, 255, 0.12)", border: "#30363d",
      statusbarBg: "#010409",
    },
    branchColors: ["#58a6ff", "#3fb950", "#d29922", "#bc8cff", "#79c0ff", "#f85149", "#56d364", "#f0883e"],
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    isDark: true,
    extension: solarizedDark,
    chrome: {
      bg: "#002b36", bgSurface: "#00212b", bgEditor: "#002b36",
      fg: "#839496", fgDim: "#586e75", accent: "#268bd2",
      accentDim: "rgba(38, 139, 210, 0.12)", border: "#073642",
      statusbarBg: "#00212b",
    },
    branchColors: ["#268bd2", "#859900", "#b58900", "#d33682", "#2aa198", "#cb4b16", "#6c71c4", "#dc322f"],
  },
  {
    id: "gruvbox-dark",
    label: "Gruvbox Dark",
    isDark: true,
    extension: gruvboxDark,
    chrome: {
      bg: "#282828", bgSurface: "#1d2021", bgEditor: "#282828",
      fg: "#ebdbb2", fgDim: "#928374", accent: "#fabd2f",
      accentDim: "rgba(250, 189, 47, 0.12)", border: "#3c3836",
      statusbarBg: "#1d2021",
    },
    branchColors: ["#fabd2f", "#b8bb26", "#83a598", "#d3869b", "#8ec07c", "#fe8019", "#fb4934", "#689d6a"],
  },
  {
    id: "material-dark",
    label: "Material Dark",
    isDark: true,
    extension: materialDark,
    chrome: {
      bg: "#263238", bgSurface: "#1e272c", bgEditor: "#263238",
      fg: "#eeffff", fgDim: "#546e7a", accent: "#82aaff",
      accentDim: "rgba(130, 170, 255, 0.12)", border: "#37474f",
      statusbarBg: "#1e272c",
    },
    branchColors: ["#82aaff", "#c3e88d", "#ffcb6b", "#c792ea", "#89ddff", "#f07178", "#f78c6c", "#ff5370"],
  },
  {
    id: "sublime",
    label: "Sublime",
    isDark: true,
    extension: sublime,
    chrome: {
      bg: "#303841", bgSurface: "#282c34", bgEditor: "#303841",
      fg: "#d4d4d4", fgDim: "#808080", accent: "#5c99d6",
      accentDim: "rgba(92, 153, 214, 0.12)", border: "#3c4049",
      statusbarBg: "#282c34",
    },
    branchColors: ["#5c99d6", "#99c27c", "#e6c07b", "#c678dd", "#56b6c2", "#e06c75", "#d19a66", "#98c379"],
  },
  {
    id: "andromeda",
    label: "Andromeda",
    isDark: true,
    extension: andromeda,
    chrome: {
      bg: "#23262e", bgSurface: "#1e2025", bgEditor: "#23262e",
      fg: "#d5ced9", fgDim: "#6e6a86", accent: "#ee5d43",
      accentDim: "rgba(238, 93, 67, 0.12)", border: "#2e323c",
      statusbarBg: "#1e2025",
    },
    branchColors: ["#ee5d43", "#96e072", "#ffe66d", "#c74ded", "#00e8c6", "#f39c12", "#ff6188", "#7cb7ff"],
  },
  {
    id: "aura",
    label: "Aura",
    isDark: true,
    extension: aura,
    chrome: {
      bg: "#15141b", bgSurface: "#110f18", bgEditor: "#15141b",
      fg: "#edecee", fgDim: "#6d6d6d", accent: "#a277ff",
      accentDim: "rgba(162, 119, 255, 0.12)", border: "#29263c",
      statusbarBg: "#110f18",
    },
    branchColors: ["#a277ff", "#61ffca", "#ffca85", "#f694ff", "#82e2ff", "#ff6767", "#edecee", "#7b7b7b"],
  },
  {
    id: "copilot",
    label: "Copilot",
    isDark: true,
    extension: copilot,
    chrome: {
      bg: "#233643", bgSurface: "#1b2d3a", bgEditor: "#233643",
      fg: "#ffffff", fgDim: "#808fa1", accent: "#4fc1ff",
      accentDim: "rgba(79, 193, 255, 0.12)", border: "#2d4a5e",
      statusbarBg: "#1b2d3a",
    },
    branchColors: ["#4fc1ff", "#89d185", "#dcdcaa", "#c586c0", "#9cdcfe", "#ce9178", "#4ec9b0", "#d7ba7d"],
  },
  {
    id: "vscode-dark",
    label: "VS Code Dark",
    isDark: true,
    extension: vscodeDark,
    chrome: {
      bg: "#1e1e1e", bgSurface: "#181818", bgEditor: "#1e1e1e",
      fg: "#d4d4d4", fgDim: "#808080", accent: "#569cd6",
      accentDim: "rgba(86, 156, 214, 0.12)", border: "#333333",
      statusbarBg: "#181818",
    },
    branchColors: ["#569cd6", "#6a9955", "#dcdcaa", "#c586c0", "#9cdcfe", "#ce9178", "#4ec9b0", "#d7ba7d"],
  },
  {
    id: "xcode-dark",
    label: "Xcode Dark",
    isDark: true,
    extension: xcodeDark,
    chrome: {
      bg: "#292a30", bgSurface: "#1f2024", bgEditor: "#292a30",
      fg: "#dfdfe0", fgDim: "#7f8c98", accent: "#6bdfff",
      accentDim: "rgba(107, 223, 255, 0.12)", border: "#3a3a42",
      statusbarBg: "#1f2024",
    },
    branchColors: ["#6bdfff", "#84b360", "#d9c97c", "#b281eb", "#4eb0cc", "#ff8170", "#ffa14f", "#acf2e4"],
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night (uiw)",
    isDark: true,
    extension: tokyoNight,
    chrome: {
      bg: "#1a1b26", bgSurface: "#16161e", bgEditor: "#1a1b26",
      fg: "#a9b1d6", fgDim: "#565f89", accent: "#7aa2f7",
      accentDim: "rgba(122, 162, 247, 0.15)", border: "#1f2335",
      statusbarBg: "#16161e",
    },
    branchColors: DARK_BRANCHES,
  },

  // ── Light themes ──
  {
    id: "github-light",
    label: "GitHub Light",
    isDark: false,
    extension: githubLight,
    chrome: {
      bg: "#f6f8fa", bgSurface: "#ffffff", bgEditor: "#ffffff",
      fg: "#1f2328", fgDim: "#656d76", accent: "#0969da",
      accentDim: "rgba(9, 105, 218, 0.1)", border: "#d0d7de",
      statusbarBg: "#f0f0f0",
    },
    branchColors: ["#0969da", "#1a7f37", "#bf8700", "#8250df", "#0550ae", "#cf222e", "#bc4c00", "#6639ba"],
  },
  {
    id: "solarized-light",
    label: "Solarized Light",
    isDark: false,
    extension: solarizedLight,
    chrome: {
      bg: "#fdf6e3", bgSurface: "#eee8d5", bgEditor: "#fdf6e3",
      fg: "#657b83", fgDim: "#93a1a1", accent: "#268bd2",
      accentDim: "rgba(38, 139, 210, 0.1)", border: "#eee8d5",
      statusbarBg: "#eee8d5",
    },
    branchColors: ["#268bd2", "#859900", "#b58900", "#d33682", "#2aa198", "#cb4b16", "#6c71c4", "#dc322f"],
  },
  {
    id: "gruvbox-light",
    label: "Gruvbox Light",
    isDark: false,
    extension: gruvboxLight,
    chrome: {
      bg: "#fbf1c7", bgSurface: "#f2e5bc", bgEditor: "#fbf1c7",
      fg: "#3c3836", fgDim: "#928374", accent: "#b57614",
      accentDim: "rgba(181, 118, 20, 0.1)", border: "#ebdbb2",
      statusbarBg: "#f2e5bc",
    },
    branchColors: ["#b57614", "#79740e", "#076678", "#8f3f71", "#427b58", "#af3a03", "#9d0006", "#689d6a"],
  },
  {
    id: "material-light",
    label: "Material Light",
    isDark: false,
    extension: materialLight,
    chrome: {
      bg: "#fafafa", bgSurface: "#f5f5f5", bgEditor: "#fafafa",
      fg: "#90a4ae", fgDim: "#b0bec5", accent: "#6182b8",
      accentDim: "rgba(97, 130, 184, 0.1)", border: "#e7e7e8",
      statusbarBg: "#f0f0f0",
    },
    branchColors: ["#6182b8", "#91b859", "#f6a434", "#7c4dff", "#39adb5", "#e53935", "#f76d47", "#8796b0"],
  },
  {
    id: "quietlight",
    label: "Quiet Light",
    isDark: false,
    extension: quietlight,
    chrome: {
      bg: "#f5f5f5", bgSurface: "#eeeeee", bgEditor: "#f5f5f5",
      fg: "#333333", fgDim: "#aaaaaa", accent: "#4b69c6",
      accentDim: "rgba(75, 105, 198, 0.1)", border: "#e0e0e0",
      statusbarBg: "#eeeeee",
    },
    branchColors: ["#4b69c6", "#7a9a4e", "#c4a000", "#7c4dff", "#2e8b98", "#c53929", "#d49b00", "#6a8759"],
  },
  {
    id: "vscode-light",
    label: "VS Code Light",
    isDark: false,
    extension: vscodeLight,
    chrome: {
      bg: "#f3f3f3", bgSurface: "#ececec", bgEditor: "#ffffff",
      fg: "#333333", fgDim: "#999999", accent: "#0066b8",
      accentDim: "rgba(0, 102, 184, 0.1)", border: "#e0e0e0",
      statusbarBg: "#ececec",
    },
    branchColors: ["#0066b8", "#008000", "#795e26", "#800080", "#267f99", "#a31515", "#e14c00", "#0070c1"],
  },
  {
    id: "xcode-light",
    label: "Xcode Light",
    isDark: false,
    extension: xcodeLight,
    chrome: {
      bg: "#ffffff", bgSurface: "#f5f5f5", bgEditor: "#ffffff",
      fg: "#262626", fgDim: "#8a99a4", accent: "#0b4f79",
      accentDim: "rgba(11, 79, 121, 0.1)", border: "#e5e5e5",
      statusbarBg: "#f5f5f5",
    },
    branchColors: ["#0b4f79", "#3e8635", "#78492a", "#ad3da4", "#326d74", "#d12f1b", "#804e00", "#272ad8"],
  },
  {
    id: "tokyo-night-day",
    label: "Tokyo Night Day (uiw)",
    isDark: false,
    extension: tokyoNightDay,
    chrome: {
      bg: "#e1e2e7", bgSurface: "#d5d6db", bgEditor: "#e1e2e7",
      fg: "#3760bf", fgDim: "#848cb5", accent: "#2e7de9",
      accentDim: "rgba(46, 125, 233, 0.1)", border: "#c4c8da",
      statusbarBg: "#d5d6db",
    },
    branchColors: LIGHT_BRANCHES,
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
  s.setProperty("--accent", chrome.accent);
  s.setProperty("--accent-dim", chrome.accentDim);
  s.setProperty("--border", chrome.border);
  s.setProperty("--statusbar-bg", chrome.statusbarBg);
}
