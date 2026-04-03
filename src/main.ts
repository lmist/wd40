import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { vim, Vim, getCM } from "@replit/codemirror-vim";
import { Transformer } from "markmap-lib";
import { Markmap, deriveOptions } from "markmap-view";
import { zoomTransform } from "d3-zoom";
import { invoke } from "@tauri-apps/api/core";
import { initFonts, setFont, getSavedFont, getFontNames } from "./fonts";
import { headingMarkers } from "./heading-markers";
import { THEMES, getThemeById, applyChromeColors, ThemeEntry } from "./themes";

const INITIAL_MD = `# https://docs.oasis.camel-ai.org/introduction
# Cheng Lou / Pretext
# opencli
# WASM & WASI
# gstack
# bank stmt, manage subscriptions
# delete aws
# Obsidian tweaking
## https://github.com/jinzcdev/obsidian-markxmind
   #    Translation
## subtitling any youtube video to arabic so we can watch with momma
## stt, translating
# THUNDER
# scrollback
## a graphrag DOES exist
### see [mirofish](https://deepwiki.com/666ghj/MiroFish/3.1-knowledge-graph-construction-(graphrag))
### oss models
### tagging sucks
# HERMES
## consider how model shifting should automatically happen based on the prompt
## someone released a council of experts methodology to make agents disagree before agreeing
### get them to create a strategy to make me popular on twitter
## Deploying to Base
### there's a video on twitter
## this idea of segregation, concepts: workspace::agent:session?
## sickest skill from hackathon: trimmer magic
## it's own twitter
## where else? virtuals?
## bnb
## security
# MISC

## skilljar
### skill writing
### then bedrock
## karpathy
### runpod
## oss models
### try in runpod
### stt
### tts
### nemotron
### kimi
### minimax (new context breakthrough)
### qwen
## [money](https://github.com/FujiwaraChoki/MoneyPrinterV2/tree/main)
## [mirofish](https://github.com/666ghj/MiroFish/tree/main)
# read read read
## Article from Sysls is always important
## Williamson handbook is always important
# GT
## chemistry class
## keep reading and reading and messing
# cornelius / heinrich bro wtf
## research specifically
## how do we gracefully load into context by using a graph
`;

// --- Theme state ---
function getInitialThemeEntry(): ThemeEntry {
  const savedId = localStorage.getItem("theme-id");
  if (savedId) {
    const found = getThemeById(savedId);
    if (found) return found;
  }
  // Fall back to system preference
  const preferLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return preferLight ? THEMES[1] : THEMES[0]; // Tokyo Night Day / Tokyo Night
}

let currentThemeEntry = getInitialThemeEntry();
document.documentElement.setAttribute("data-theme", currentThemeEntry.isDark ? "dark" : "light");
applyChromeColors(currentThemeEntry.chrome);

// --- Markmap setup ---
const transformer = new Transformer();
const svgEl = document.getElementById("markmap") as unknown as SVGElement;
let mm: Markmap;

function getMarkmapOpts() {
  return deriveOptions({
    colorFreezeLevel: 2,
    color: currentThemeEntry.branchColors,
    initialExpandLevel: -1,
    paddingX: 16,
    spacingVertical: 8,
  });
}

function applyMarkmapTheme() {
  svgEl.classList.remove("markmap-dark", "markmap-light");
  svgEl.classList.add(currentThemeEntry.isDark ? "markmap-dark" : "markmap-light");
}

async function updateMarkmap(md: string) {
  let root: any;
  try {
    root = await invoke('parse_markdown', { md });
  } catch (_) {
    // Fallback to JS transformer
    root = transformer.transform(md).root;
  }
  const opts = getMarkmapOpts();
  if (!mm) {
    mm = Markmap.create(svgEl, opts, root);
    applyMarkmapTheme();
    setTimeout(() => mm.fit(), 100);
  } else {
    mm.setData(root, opts);
    setTimeout(() => mm.fit(), 50);
  }
}

// --- Debounce ---
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as unknown as T;
}

const debouncedUpdate = debounce((md: string) => updateMarkmap(md), 50);

// --- Vim mode indicator ---
const vimModeEl = document.getElementById("vim-mode")!;

// --- Editor setup ---
const editorPane = document.getElementById("editor-pane")!;
const themeCompartment = new Compartment();

const editor = new EditorView({
  state: EditorState.create({
    doc: INITIAL_MD,
    extensions: [
      vim(),
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      markdown(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      themeCompartment.of(currentThemeEntry.extension),
      headingMarkers,
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          debouncedUpdate(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
      }),
    ],
  }),
  parent: editorPane,
});

// Track vim mode changes
try {
  (Vim as any).on("vim-mode-change", (ev: { mode: string; subMode?: string }) => {
    let mode = ev.mode;
    if (mode === "visual" && ev.subMode === "linewise") mode = "v-line";
    if (mode === "visual" && ev.subMode === "blockwise") mode = "v-block";
    vimModeEl.textContent = mode.toUpperCase();
  });
} catch (_) {}

// --- .vimrc support ---
const VIMRC_KEY = "vimrc";

function applyVimrc() {
  const vimrc = localStorage.getItem(VIMRC_KEY) || "";
  const cm = getCM(editor);
  if (!cm) return;
  for (const raw of vimrc.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith('"')) continue; // skip empty lines and comments
    try {
      (Vim as any).handleEx(cm, line);
    } catch (_) {
      // silently skip invalid commands
    }
  }
}

// Modal elements
const vimrcOverlay = document.getElementById("vimrc-overlay")!;
const vimrcEditor = document.getElementById("vimrc-editor") as HTMLTextAreaElement;
const vimrcSaveBtn = document.getElementById("vimrc-save")!;
const vimrcCloseBtn = document.getElementById("vimrc-close")!;
const vimrcBtn = document.getElementById("btn-vimrc")!;

function openVimrc() {
  vimrcEditor.value = localStorage.getItem(VIMRC_KEY) || "";
  vimrcOverlay.classList.remove("hidden");
  vimrcEditor.focus();
}

function closeVimrc() {
  vimrcOverlay.classList.add("hidden");
  editor.focus();
}

function saveVimrc() {
  localStorage.setItem(VIMRC_KEY, vimrcEditor.value);
  applyVimrc();
  closeVimrc();
}

vimrcBtn.addEventListener("click", openVimrc);
vimrcCloseBtn.addEventListener("click", closeVimrc);
vimrcSaveBtn.addEventListener("click", saveVimrc);
vimrcOverlay.addEventListener("click", (e) => {
  if (e.target === vimrcOverlay) closeVimrc();
});

// Keyboard: Escape to close modal
vimrcOverlay.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.stopPropagation();
    closeVimrc();
  }
  // Cmd+Enter to save
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    saveVimrc();
  }
});

// Apply saved vimrc on startup
applyVimrc();

// --- Initial render ---
updateMarkmap(INITIAL_MD);

// --- Toolbar controls ---
document.getElementById("btn-fit")!.addEventListener("click", () => mm?.fit());

function zoomBy(factor: number) {
  if (!mm) return;
  const svg = (mm as any).svg.node() as SVGSVGElement;
  const t = zoomTransform(svg);
  const zoom = (mm as any).zoom;
  (mm as any).svg.transition().duration(200).call(
    zoom.transform,
    t.scale(factor)
  );
}

document.getElementById("btn-zoom-in")!.addEventListener("click", () => zoomBy(1.3));
document.getElementById("btn-zoom-out")!.addEventListener("click", () => zoomBy(0.77));

function walkTree(node: any, fn: (n: any) => void) {
  fn(node);
  if (node.children) node.children.forEach((c: any) => walkTree(c, fn));
}

document.getElementById("btn-expand-all")!.addEventListener("click", () => {
  if (!mm) return;
  const data = (mm as any).state.data;
  walkTree(data, (n) => { n.payload = { ...n.payload, fold: 0 }; });
  mm.renderData();
  setTimeout(() => mm.fit(), 50);
});

document.getElementById("btn-collapse-all")!.addEventListener("click", () => {
  if (!mm) return;
  const data = (mm as any).state.data;
  // Collapse everything except root
  walkTree(data, (n) => {
    if (n.children?.length) n.payload = { ...n.payload, fold: 1 };
  });
  data.payload = { ...data.payload, fold: 0 }; // keep root open
  mm.renderData();
  setTimeout(() => mm.fit(), 50);
});

// Keyboard shortcut: Cmd+Shift+F to fit
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
    e.preventDefault();
    mm?.fit();
  }
});

// --- Resizable divider ---
const divider = document.getElementById("divider")!;

let isDragging = false;

divider.addEventListener("mousedown", (e) => {
  isDragging = true;
  divider.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const appWidth = document.getElementById("app")!.clientWidth;
  const newWidth = Math.max(200, Math.min(e.clientX, appWidth - 200));
  editorPane.style.width = `${newWidth}px`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    divider.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    mm?.fit();
  }
});

// --- Resize observer for markmap ---
const debouncedFit = debounce(() => mm?.fit(), 150);
new ResizeObserver(() => debouncedFit()).observe(
  document.getElementById("mindmap-pane")!
);

// --- Theme system ---
function setThemeById(id: string) {
  const entry = getThemeById(id);
  if (!entry) return;

  currentThemeEntry = entry;
  localStorage.setItem("theme-id", id);
  document.documentElement.setAttribute("data-theme", entry.isDark ? "dark" : "light");
  applyChromeColors(entry.chrome);

  // Remember last dark/light choice for the toggle button
  localStorage.setItem(entry.isDark ? "last-dark-theme" : "last-light-theme", id);

  // Swap CodeMirror theme
  editor.dispatch({
    effects: themeCompartment.reconfigure(entry.extension),
  });

  // Re-render markmap with new colors
  applyMarkmapTheme();
  const md = editor.state.doc.toString();
  updateMarkmap(md);

  // Sync the theme picker select
  const picker = document.getElementById("theme-picker") as HTMLSelectElement;
  if (picker.value !== id) picker.value = id;
}

// Toggle button: quick dark/light swap
document.getElementById("btn-theme")!.addEventListener("click", () => {
  if (currentThemeEntry.isDark) {
    const lightId = localStorage.getItem("last-light-theme") || "tokyo-night-day-custom";
    setThemeById(lightId);
  } else {
    const darkId = localStorage.getItem("last-dark-theme") || "tokyo-night-custom";
    setThemeById(darkId);
  }
});

// Respect system preference changes
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
  if (!localStorage.getItem("theme-id")) {
    setThemeById(e.matches ? "tokyo-night-day-custom" : "tokyo-night-custom");
  }
});

// --- Theme picker ---
const themePicker = document.getElementById("theme-picker") as HTMLSelectElement;

// Group themes by dark/light
const darkThemes = THEMES.filter((t) => t.isDark);
const lightThemes = THEMES.filter((t) => !t.isDark);

function addThemeGroup(label: string, themes: ThemeEntry[]) {
  const group = document.createElement("optgroup");
  group.label = label;
  for (const t of themes) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.label;
    if (t.id === currentThemeEntry.id) opt.selected = true;
    group.appendChild(opt);
  }
  themePicker.appendChild(group);
}

addThemeGroup("Dark", darkThemes);
addThemeGroup("Light", lightThemes);

themePicker.addEventListener("change", () => {
  setThemeById(themePicker.value);
});

// --- Font picker ---
const fontPicker = document.getElementById("font-picker") as HTMLSelectElement;
const savedFont = getSavedFont();

for (const name of getFontNames()) {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  if (name === savedFont) opt.selected = true;
  fontPicker.appendChild(opt);
}

fontPicker.addEventListener("change", () => {
  setFont(fontPicker.value);
});

// Load saved font on startup
initFonts();
