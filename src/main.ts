import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from "@codemirror/view";
import { EditorState, Compartment, Prec } from "@codemirror/state";
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
import { EDITOR_STYLES, applyEditorStyleTokens, getEditorStyleById, EditorStyleEntry } from "./editor-styles";
import { headingMarkers } from "./heading-markers";
import { rememberPreviousMap, swapToPreviousMap } from "./map-history";
import { THEMES, getThemeById, applyChromeColors, ThemeEntry } from "./themes";
import { indentedTextToMarkdown, markdownToIndentedText } from "./transform";
import { outlinerKeymap, setClimbCallbacks, isClimbing, endClimb, handleClimbDigit } from "./outliner";
import { showHud, updateHud, hideHud } from "./level-hud";

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

const INITIAL_CONTENT = `Welcome
  Start with a simple heading
    Each heading becomes a branch on the map
    Use short phrases instead of long paragraphs
  Try planning something familiar
    Weekend dinner
    Family trip
    Study notes
  A calm way to work
    Write on the left
    Scan the structure on the right
    Adjust keyboard rules any time from Keyboard
`;

/** Detect if content is legacy markdown (has # headings) and convert to indented text. */
export function migrateContent(content: string): string {
  // If any non-empty line starts with #, treat as legacy markdown
  const lines = content.split("\n");
  const hasHeadings = lines.some(l => /^#{1,6}\s/.test(l));
  if (hasHeadings) {
    return markdownToIndentedText(content);
  }
  return content;
}

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

function getInitialEditorStyleEntry(): EditorStyleEntry {
  const savedId = localStorage.getItem("editor-style-id");
  if (savedId) {
    const found = getEditorStyleById(savedId);
    if (found) return found;
  }
  return EDITOR_STYLES[0];
}

let currentEditorStyleEntry = getInitialEditorStyleEntry();
document.documentElement.setAttribute("data-editor-style", currentEditorStyleEntry.id);
applyEditorStyleTokens(currentEditorStyleEntry.tokens);

function currentEditorAppearance() {
  return [currentThemeEntry.extension, currentEditorStyleEntry.extension];
}

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
vimModeEl.dataset.mode = "normal";

// --- Shortcuts modal (early ref for editor keybinding) ---
const shortcutsOverlayEl = document.getElementById("shortcuts-overlay")!;
function toggleShortcutsModal() {
  if (shortcutsOverlayEl.classList.contains("hidden")) {
    // Close vimrc modal if open
    const vimrcOv = document.getElementById("vimrc-overlay")!;
    if (!vimrcOv.classList.contains("hidden")) vimrcOv.classList.add("hidden");
    shortcutsOverlayEl.classList.remove("hidden");
  } else {
    shortcutsOverlayEl.classList.add("hidden");
  }
}

// --- Editor setup ---
const editorPane = document.getElementById("editor-pane")!;
const appearanceCompartment = new Compartment();
const vimCompartment = new Compartment();
const lineNumbersCompartment = new Compartment();

// Vim enabled state (persisted)
const VIM_ENABLED_KEY = "vim-enabled";
let vimEnabled = localStorage.getItem(VIM_ENABLED_KEY) !== "false"; // default: true

// Line numbers off by default (toggled via `set nu` in vimrc)
let lineNumbersEnabled = false;

const editor = new EditorView({
  state: EditorState.create({
    doc: INITIAL_CONTENT,
    extensions: [
      // Shift+? must beat vim's reverse-search binding in every mode
      Prec.highest(keymap.of([{
        key: "Shift-?",
        run: () => { toggleShortcutsModal(); return true; },
        preventDefault: true,
      }])),
      vimCompartment.of(vimEnabled ? vim() : []),
      drawSelection({ cursorBlinkRate: 0 }),
      lineNumbersCompartment.of(lineNumbersEnabled ? lineNumbers() : []),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      appearanceCompartment.of(currentEditorAppearance()),
      headingMarkers,
      highlightSelectionMatches(),
      outlinerKeymap,
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const indented = update.state.doc.toString();
          const md = indentedTextToMarkdown(indented);
          debouncedUpdate(md);
        }
      }),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
      }),
      EditorView.domEventHandlers({
        keydown(event: KeyboardEvent) {
          // During climb mode, intercept digits and letters
          if (isClimbing()) {
            const digit = parseInt(event.key);
            if (!isNaN(digit) && digit >= 1 && digit <= 9) {
              event.preventDefault();
              handleClimbDigit(editor, digit);
              return true;
            }
            // Any letter or printable char ends climb
            if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
              endClimb();
              // Don't prevent default — let the character be typed
              return false;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              endClimb();
              return true;
            }
          }
          return false;
        },
      }),
    ],
  }),
  parent: editorPane,
});

// Wire up climb callbacks to the HUD
setClimbCallbacks(
  (level) => showHud(editor, level),  // onClimbStart
  (level) => updateHud(level),         // onClimbStep
  () => hideHud(),                     // onClimbEnd
);

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
    vimModeEl.dataset.mode = ev.mode;
  });
} catch (_) {}

// --- Tab bar rendering ---
const titlebar = document.getElementById("titlebar")!;
const tabBar = document.getElementById("tab-bar")!;
const titlebarMapSummaryEl = document.getElementById("titlebar-map-summary")!;
const fileNameEl = document.getElementById("file-name")!;
const appWindow = "__TAURI_INTERNALS__" in window ? getCurrentWindow() : null;
let previousTabId = "";

function isTitlebarInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("#titlebar button") !== null;
}

titlebar.addEventListener("mousedown", (event) => {
  if (event.button !== 0 || isTitlebarInteractiveTarget(event.target)) return;
  event.preventDefault();
  void appWindow?.startDragging().catch(() => {});
});

titlebar.addEventListener("dblclick", (event) => {
  if (isTitlebarInteractiveTarget(event.target)) return;
  event.preventDefault();
  void appWindow?.toggleMaximize().catch(() => {});
});

function updateTitlebarSummary() {
  titlebarMapSummaryEl.textContent = tabs.length === 1 ? "1 map open" : `${tabs.length} maps open`;
}

function renderTabBar() {
  tabBar.innerHTML = "";
  for (const tab of tabs) {
    const btn = document.createElement("button");
    btn.textContent = tab.name;
    if (tab.id === activeTabId) btn.classList.add("active");
    btn.addEventListener("click", () => switchTab(tab.id));
    tabBar.appendChild(btn);
  }
  updateTitlebarSummary();
}

function switchTab(id: string, options?: { preservePrevious?: boolean }) {
  if (id === activeTabId) return;
  if (!options?.preservePrevious) {
    previousTabId = rememberPreviousMap(activeTabId, id, previousTabId);
  }
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
    updateMarkmap(indentedTextToMarkdown(target.content));
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
  const tab: Tab = { id: crypto.randomUUID(), name, content: name + "\n" };
  previousTabId = rememberPreviousMap(activeTabId, tab.id, previousTabId);
  tabs.push(tab);
  activeTabId = tab.id;
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: tab.content },
  });
  updateMarkmap(indentedTextToMarkdown(tab.content));
  fileNameEl.textContent = tab.name;
  renderTabBar();
  editor.focus();
}

function goToPreviousMap() {
  const next = swapToPreviousMap(activeTabId, previousTabId);
  if (!next) return;
  previousTabId = next.previousMapId;
  switchTab(next.activeMapId, { preservePrevious: true });
}

// Initialize first tab
const firstTab: Tab = { id: crypto.randomUUID(), name: "Welcome note", content: INITIAL_CONTENT };
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
(Vim as any).defineAction("previousMap", () => goToPreviousMap());

(Vim as any).mapCommand("`c", "action", "newTab", {}, { context: "normal" });
(Vim as any).mapCommand("``", "action", "previousMap", {}, { context: "normal" });
(Vim as any).mapCommand("`z", "action", "focusPane", {}, { context: "normal" });
(Vim as any).mapCommand("`b", "action", "balancePanes", {}, { context: "normal" });
(Vim as any).mapCommand("`h", "action", "shrinkPane", {}, { context: "normal" });
(Vim as any).mapCommand("`l", "action", "expandPane", {}, { context: "normal" });

// --- Vim toggle ---
function setVimEnabled(enabled: boolean) {
  vimEnabled = enabled;
  localStorage.setItem(VIM_ENABLED_KEY, String(enabled));
  editor.dispatch({
    effects: vimCompartment.reconfigure(enabled ? vim() : []),
  });

  // Update vim mode display
  if (enabled) {
    vimModeEl.style.display = "";
    vimModeEl.textContent = "Normal";
    vimModeEl.dataset.mode = "normal";
    currentVimMode = "normal";
    // Re-apply vimrc after enabling
    requestAnimationFrame(() => applyVimrc());
  } else {
    vimModeEl.style.display = "none";
    currentVimMode = "normal";
  }

  // Update toggle button
  const toggle = document.getElementById("vim-toggle") as HTMLInputElement | null;
  if (toggle) toggle.checked = enabled;
}

// --- `set nu` / `set nonu` support ---
function setLineNumbers(enabled: boolean) {
  lineNumbersEnabled = enabled;
  editor.dispatch({
    effects: lineNumbersCompartment.reconfigure(enabled ? lineNumbers() : []),
  });
}

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
    if (!line || line.startsWith('"')) continue;

    // Handle `set nu` / `set nonu` / `set number` / `set nonumber`
    if (/^set\s+(no)?(nu|number)$/.test(line)) {
      const hasNo = line.includes("no");
      setLineNumbers(!hasNo);
      continue;
    }

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
const shortcutsCloseBtn = document.getElementById("shortcuts-close")!;

function closeShortcuts() {
  shortcutsOverlayEl.classList.add("hidden");
  editor.focus();
}

shortcutsCloseBtn.addEventListener("click", closeShortcuts);
shortcutsOverlayEl.addEventListener("click", (e) => {
  if (e.target === shortcutsOverlayEl) closeShortcuts();
});

shortcutsOverlayEl.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "?") {
    e.stopPropagation();
    e.preventDefault();
    closeShortcuts();
  }
});

// Shift+? to open shortcuts — works in any pane, any vim mode, anywhere
// (CodeMirror is handled by the Prec.highest keybinding in the editor setup)
document.addEventListener("keydown", (e) => {
  if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
    // Only skip if user is typing in the vimrc textarea
    const target = e.target as HTMLElement;
    if (target.id === "vimrc-editor") return;
    e.preventDefault();
    toggleShortcutsModal();
  }
});

// --- Initial render ---
updateMarkmap(indentedTextToMarkdown(INITIAL_CONTENT));

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
      effects: appearanceCompartment.reconfigure(currentEditorAppearance()),
    });

    // Re-render markmap with new colors
    applyMarkmapTheme();
    const indented = editor.state.doc.toString();
    updateMarkmap(indentedTextToMarkdown(indented));

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

function setEditorStyleById(id: string) {
  const entry = getEditorStyleById(id);
  if (!entry) return;

  currentEditorStyleEntry = entry;
  localStorage.setItem("editor-style-id", id);
  document.documentElement.setAttribute("data-editor-style", entry.id);
  applyEditorStyleTokens(entry.tokens);

  editorPane.style.transition = "opacity 0.15s ease";
  editorPane.style.opacity = "0.72";
  requestAnimationFrame(() => {
    editor.dispatch({
      effects: appearanceCompartment.reconfigure(currentEditorAppearance()),
    });

    requestAnimationFrame(() => {
      editorPane.style.opacity = "1";
      editorPane.addEventListener("transitionend", () => {
        editorPane.style.transition = "";
      }, { once: true });
    });
  });

  const picker = document.getElementById("editor-style-picker") as HTMLSelectElement;
  if (picker.value !== id) picker.value = id;
  editor.focus();
}

// Toggle button: cycle through all 3 themes
document.getElementById("btn-theme")!.addEventListener("click", () => {
  const idx = THEMES.findIndex((t) => t.id === currentThemeEntry.id);
  const next = THEMES[(idx + 1) % THEMES.length];
  setThemeById(next.id);
});

document.getElementById("btn-new-tab")!.addEventListener("click", () => createNewTab());

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

// --- Editor style picker ---
const editorStylePicker = document.getElementById("editor-style-picker") as HTMLSelectElement;

for (const style of EDITOR_STYLES) {
  const opt = document.createElement("option");
  opt.value = style.id;
  opt.textContent = style.label;
  if (style.id === currentEditorStyleEntry.id) opt.selected = true;
  editorStylePicker.appendChild(opt);
}

editorStylePicker.addEventListener("change", () => {
  setEditorStyleById(editorStylePicker.value);
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

// --- Vim toggle ---
const vimToggle = document.getElementById("vim-toggle") as HTMLInputElement;
vimToggle.checked = vimEnabled;
vimToggle.addEventListener("change", () => {
  setVimEnabled(vimToggle.checked);
  editor.focus();
});

// Hide vim mode badge if vim is disabled on startup
if (!vimEnabled) {
  vimModeEl.style.display = "none";
}

// Load saved font on startup
initFonts();
