import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { vim, Vim } from "@replit/codemirror-vim";
import { Transformer } from "markmap-lib";
import { Markmap, deriveOptions } from "markmap-view";
import { zoomTransform } from "d3";
import { oneDark } from "./theme";

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

// --- Color palette: muted, harmonious tones for dark bg ---
const BRANCH_COLORS = [
  "#7aa2f7", // soft blue
  "#9ece6a", // sage green
  "#e0af68", // warm amber
  "#bb9af7", // soft purple
  "#7dcfff", // sky cyan
  "#f7768e", // soft coral
  "#73daca", // teal
  "#ff9e64", // peach
];

// --- Markmap setup ---
const transformer = new Transformer();
const svgEl = document.getElementById("markmap") as unknown as SVGElement;
let mm: Markmap;

function updateMarkmap(md: string) {
  const { root } = transformer.transform(md);
  const opts = deriveOptions({
    colorFreezeLevel: 2,
    color: BRANCH_COLORS,
    initialExpandLevel: -1,
    paddingX: 16,
    spacingVertical: 8,
  });
  if (!mm) {
    mm = Markmap.create(svgEl, opts, root);
    svgEl.classList.add("markmap-dark");
    // Auto-fit after layout settles
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

const debouncedUpdate = debounce((md: string) => updateMarkmap(md), 200);

// --- Vim mode indicator ---
const vimModeEl = document.getElementById("vim-mode")!;

// --- Editor setup ---
const editorPane = document.getElementById("editor-pane")!;

new EditorView({
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
      oneDark,
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
new ResizeObserver(() => mm?.fit()).observe(
  document.getElementById("mindmap-pane")!
);
