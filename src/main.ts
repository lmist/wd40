import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from "@codemirror/view";
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
import { getCurrentWindow } from "@tauri-apps/api/window";
import { initFonts, setFont, getSavedFont, getFontNames } from "./fonts";
import { headingMarkers } from "./heading-markers";
import { THEMES, getThemeById, applyChromeColors, ThemeEntry } from "./themes";

function uniqueTabName(existing: string[]): string {
  const set = new Set(existing);
  if (!set.has("Untitled note")) return "Untitled note";
  let index = 2;
  while (set.has(`Untitled note ${index}`)) index += 1;
  return `Untitled note ${index}`;
}

// --- Tab system ---
interface Tab {
  id: string;
  name: string;
  content: string;
}

let tabs: Tab[] = [];
let activeTabId = "";

const INITIAL_MD = `# Welcome
## Start with a simple heading
### Each heading becomes a branch on the map
### Use short phrases instead of long paragraphs
## Try planning something familiar
### Weekend dinner
### Family trip
### Study notes
## A calm way to work
### Write on the left
### Scan the structure on the right
### Adjust keyboard rules any time from Keyboard
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
  return preferLight ? THEMES[1] : THEMES[0]; // wd40 Light / wd40 Dark
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
    paddingX: 20,
    spacingVertical: 12,
  });
}

function applyMarkmapTheme() {
  svgEl.classList.remove("markmap-dark", "markmap-light", "markmap-dusk");
  const cls = currentThemeEntry.id === "wd40-dusk" ? "markmap-dusk"
    : currentThemeEntry.isDark ? "markmap-dark" : "markmap-light";
  svgEl.classList.add(cls);
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
    (mm as any).options.duration = 300;
    setTimeout(() => mm.fit(), 100);
  } else {
    mm.setData(root, opts);
    (mm as any).options.duration = 300;
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

const debouncedUpdate = debounce((md: string) => updateMarkmap(md), 150);

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
      drawSelection(),
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

let currentVimMode = "normal";

function formatVimModeLabel(mode: string, subMode?: string): string {
  if (mode === "visual" && subMode === "linewise") return "Visual line";
  if (mode === "visual" && subMode === "blockwise") return "Visual block";
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

// The vim adapter reserves number keys as count prefixes before user maps run,
// so force the shipped "1 -> $" behavior at the editor boundary.
editor.dom.addEventListener("keydown", (event) => {
  if (
    currentVimMode !== "normal" ||
    event.key !== "1" ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  ) {
    return;
  }
  const cm = getCM(editor);
  if (!cm) return;
  event.preventDefault();
  event.stopPropagation();
  void (Vim as any).handleKey(cm, "$", "user");
}, true);

// Track vim mode changes
try {
  const cm = getCM(editor);
  cm?.on("vim-mode-change", (ev: { mode: string; subMode?: string }) => {
    currentVimMode = ev.mode;
    vimModeEl.textContent = formatVimModeLabel(ev.mode, ev.subMode);
  });
} catch (_) {}

// --- Tab bar rendering ---
const tabBar = document.getElementById("tab-bar")!;
const fileNameEl = document.getElementById("file-name")!;
const appWindow = getCurrentWindow();

function isTabBarButtonTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("#tab-bar button") !== null;
}

tabBar.addEventListener("mousedown", (event) => {
  if (event.button !== 0 || isTabBarButtonTarget(event.target)) return;
  event.preventDefault();
  void appWindow.startDragging().catch(() => {});
});

tabBar.addEventListener("dblclick", (event) => {
  if (isTabBarButtonTarget(event.target)) return;
  event.preventDefault();
  void appWindow.toggleMaximize().catch(() => {});
});

function renderTabBar() {
  tabBar.innerHTML = "";
  for (const tab of tabs) {
    const btn = document.createElement("button");
    btn.textContent = tab.name;
    if (tab.id === activeTabId) btn.classList.add("active");
    btn.addEventListener("click", () => switchTab(tab.id));
    tabBar.appendChild(btn);
  }
}

function switchTab(id: string) {
  if (id === activeTabId) return;
  // Save current content
  const current = tabs.find(t => t.id === activeTabId);
  if (current) current.content = editor.state.doc.toString();
  // Load target
  const target = tabs.find(t => t.id === id);
  if (!target) return;
  // Cross-fade
  editorPane.style.transition = "opacity 0.1s ease";
  editorPane.style.opacity = "0.5";
  requestAnimationFrame(() => {
    activeTabId = id;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: target.content },
    });
    updateMarkmap(target.content);
    fileNameEl.textContent = target.name;
    renderTabBar();
    requestAnimationFrame(() => {
      editorPane.style.opacity = "1";
      editorPane.addEventListener("transitionend", () => {
        editorPane.style.transition = "";
      }, { once: true });
    });
    editor.focus();
  });
}

function createNewTab() {
  // Save current content first
  const current = tabs.find(t => t.id === activeTabId);
  if (current) current.content = editor.state.doc.toString();
  const name = uniqueTabName(tabs.map(t => t.name));
  const tab: Tab = { id: crypto.randomUUID(), name, content: "# " + name + "\n" };
  tabs.push(tab);
  activeTabId = tab.id;
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: tab.content },
  });
  updateMarkmap(tab.content);
  fileNameEl.textContent = tab.name;
  renderTabBar();
  editor.focus();
}

// Initialize first tab
const firstTab: Tab = { id: crypto.randomUUID(), name: "Welcome note", content: INITIAL_MD };
tabs.push(firstTab);
activeTabId = firstTab.id;
fileNameEl.textContent = firstTab.name;
renderTabBar();
vimModeEl.textContent = formatVimModeLabel(currentVimMode);

// --- Active pane tracking ---
let activePane: "editor" | "mindmap" = "editor";
const mindmapPane = document.getElementById("mindmap-pane")!;

function setActivePane(pane: "editor" | "mindmap") {
  activePane = pane;
  editorPane.classList.toggle("pane-active", pane === "editor");
  mindmapPane.classList.toggle("pane-active", pane === "mindmap");
}

editorPane.addEventListener("mousedown", () => setActivePane("editor"));
mindmapPane.addEventListener("mousedown", () => setActivePane("mindmap"));
setActivePane("editor"); // default

// --- Pane management ---
type PaneState = "both" | "editor" | "mindmap";
let paneState: PaneState = "both";
const dividerEl = document.getElementById("divider")!;
let savedEditorWidth = "";

function toggleFocusPane() {
  if (paneState === "both") {
    // Save current width for restore
    savedEditorWidth = editorPane.style.width || "38%";
    if (activePane === "editor") {
      mindmapPane.style.display = "none";
      dividerEl.style.display = "none";
      editorPane.style.width = "100%";
      paneState = "editor";
    } else {
      editorPane.style.display = "none";
      dividerEl.style.display = "none";
      paneState = "mindmap";
    }
  } else {
    // Restore both
    editorPane.style.display = "";
    editorPane.style.width = savedEditorWidth;
    dividerEl.style.display = "";
    mindmapPane.style.display = "";
    paneState = "both";
    editor.focus();
  }
  setTimeout(() => mm?.fit(), 100);
}

function balancePanes() {
  if (paneState !== "both") {
    editorPane.style.display = "";
    dividerEl.style.display = "";
    mindmapPane.style.display = "";
    paneState = "both";
  }
  editorPane.style.width = "50%";
  setTimeout(() => mm?.fit(), 100);
}

// --- Resize mode ---
const resizeBadge = document.getElementById("resize-badge")!;
let resizeModeActive = false;
let resizeHandler: ((e: KeyboardEvent) => void) | null = null;

function exitResizeMode() {
  if (!resizeModeActive) return;
  resizeModeActive = false;
  resizeBadge.classList.remove("visible");
  if (resizeHandler) {
    document.removeEventListener("keydown", resizeHandler, true);
    resizeHandler = null;
  }
  editor.focus();
}

function resizeEditorBy(delta: number) {
  if (paneState !== "both") return;
  const appWidth = document.getElementById("app")!.clientWidth;
  const currentWidth = editorPane.offsetWidth;
  const newWidth = Math.max(200, Math.min(currentWidth + delta, appWidth - 200));
  editorPane.style.width = `${newWidth}px`;
  setTimeout(() => mm?.fit(), 50);
}

function enterResizeMode(initialDelta: number) {
  if (paneState !== "both") return;
  resizeEditorBy(initialDelta);
  if (resizeModeActive) return; // already in resize mode
  resizeModeActive = true;
  resizeBadge.classList.add("visible");

  resizeHandler = (e: KeyboardEvent) => {
    if (e.key === "h") {
      e.preventDefault();
      e.stopPropagation();
      resizeEditorBy(-60);
    } else if (e.key === "l") {
      e.preventDefault();
      e.stopPropagation();
      resizeEditorBy(60);
    } else {
      // Any other key exits resize mode
      e.stopPropagation();
      exitResizeMode();
      // Don't prevent default for Escape so vim can process it
      if (e.key !== "Escape") e.preventDefault();
    }
  };
  document.addEventListener("keydown", resizeHandler, true);
}

// --- Vim keybindings (backtick leader) ---
(Vim as any).defineAction("newTab", () => createNewTab());
(Vim as any).defineAction("focusPane", () => toggleFocusPane());
(Vim as any).defineAction("balancePanes", () => balancePanes());
(Vim as any).defineAction("shrinkPane", () => enterResizeMode(-60));
(Vim as any).defineAction("expandPane", () => enterResizeMode(60));

(Vim as any).mapCommand("`c", "action", "newTab", {}, { context: "normal" });
(Vim as any).mapCommand("`z", "action", "focusPane", {}, { context: "normal" });
(Vim as any).mapCommand("`b", "action", "balancePanes", {}, { context: "normal" });
(Vim as any).mapCommand("`h", "action", "shrinkPane", {}, { context: "normal" });
(Vim as any).mapCommand("`l", "action", "expandPane", {}, { context: "normal" });

// --- .vimrc support ---
const VIMRC_KEY = "vimrc";
const DEFAULT_VIMRC = [
  "inoremap qw <Esc>",
  "nnoremap ; :",
  "vnoremap ; :",
  "nnoremap 1 $",
].join("\n");

function getConfiguredVimrc() {
  return localStorage.getItem(VIMRC_KEY) ?? DEFAULT_VIMRC;
}

function applyVimrc() {
  const vimrc = getConfiguredVimrc();
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
  vimrcEditor.value = getConfiguredVimrc();
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

// --- Keyboard shortcuts modal ---
const shortcutsOverlay = document.getElementById("shortcuts-overlay")!;
const shortcutsCloseBtn = document.getElementById("shortcuts-close")!;

function openShortcuts() {
  shortcutsOverlay.classList.remove("hidden");
}

function closeShortcuts() {
  shortcutsOverlay.classList.add("hidden");
  editor.focus();
}

shortcutsCloseBtn.addEventListener("click", closeShortcuts);
shortcutsOverlay.addEventListener("click", (e) => {
  if (e.target === shortcutsOverlay) closeShortcuts();
});

shortcutsOverlay.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "?") {
    e.stopPropagation();
    e.preventDefault();
    closeShortcuts();
  }
});

// Shift+? to open shortcuts (only when not typing in an input)
document.addEventListener("keydown", (e) => {
  if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    // Don't trigger in insert mode
    if (currentVimMode === "insert") return;
    // Don't trigger if vimrc modal is open
    if (!vimrcOverlay.classList.contains("hidden")) return;
    e.preventDefault();
    if (!shortcutsOverlay.classList.contains("hidden")) {
      closeShortcuts();
    } else {
      openShortcuts();
    }
  }
});

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
  editorPane.style.transition = "none";
  divider.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const appWidth = document.getElementById("app")!.clientWidth;
  const minW = 200;
  const maxW = appWidth - 200;
  let desired = e.clientX;
  // Rubber-band resistance below minimum
  if (desired < minW) {
    desired = minW + (desired - minW) * 0.3;
  } else if (desired > maxW) {
    desired = maxW + (desired - maxW) * 0.3;
  }
  editorPane.style.width = `${desired}px`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    divider.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    const appWidth = document.getElementById("app")!.clientWidth;
    const currentWidth = editorPane.offsetWidth;
    const minW = 200;
    const maxW = appWidth - 200;
    if (currentWidth < minW || currentWidth > maxW) {
      const clamped = Math.max(minW, Math.min(currentWidth, maxW));
      editorPane.style.transition = "width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
      editorPane.style.width = `${clamped}px`;
      const clearTransition = () => {
        editorPane.style.transition = "";
        editorPane.removeEventListener("transitionend", clearTransition);
      };
      editorPane.addEventListener("transitionend", clearTransition);
    } else {
      editorPane.style.transition = "";
    }
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


  // Fade editor during theme swap
  editorPane.style.transition = "opacity 0.15s ease";
  editorPane.style.opacity = "0.6";
  requestAnimationFrame(() => {
    // Swap CodeMirror theme
    editor.dispatch({
      effects: themeCompartment.reconfigure(entry.extension),
    });

    // Re-render markmap with new colors
    applyMarkmapTheme();
    const md = editor.state.doc.toString();
    updateMarkmap(md);

    requestAnimationFrame(() => {
      editorPane.style.opacity = "1";
      editorPane.addEventListener("transitionend", () => {
        editorPane.style.transition = "";
      }, { once: true });
    });
  });

  // Sync the theme picker select
  const picker = document.getElementById("theme-picker") as HTMLSelectElement;
  if (picker.value !== id) picker.value = id;
}

// Toggle button: cycle through all 3 themes
document.getElementById("btn-theme")!.addEventListener("click", () => {
  const idx = THEMES.findIndex((t) => t.id === currentThemeEntry.id);
  const next = THEMES[(idx + 1) % THEMES.length];
  setThemeById(next.id);
});

// --- Theme picker ---
const themePicker = document.getElementById("theme-picker") as HTMLSelectElement;

for (const t of THEMES) {
  const opt = document.createElement("option");
  opt.value = t.id;
  opt.textContent = t.label;
  if (t.id === currentThemeEntry.id) opt.selected = true;
  themePicker.appendChild(opt);
}

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
