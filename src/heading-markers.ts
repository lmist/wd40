import { EditorState, Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { lineLevel } from "./outliner";

const MIN_MARKER_LEVEL = 2;

class HeadingWidget extends WidgetType {
  constructor(
    readonly level: number,
    readonly whitespace: string,
    readonly animateIn: boolean,
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = `cm-heading-marker cm-heading-marker-${this.level}`;
    if (this.animateIn) wrapper.classList.add("cm-heading-marker-enter");
    wrapper.dataset.level = String(this.level);
    wrapper.setAttribute("aria-hidden", "true");

    const spacer = document.createElement("span");
    spacer.className = "cm-heading-marker-spacer";
    spacer.textContent = this.whitespace;

    const glyph = document.createElement("span");
    glyph.className = "cm-heading-marker-glyph";

    wrapper.append(spacer, glyph);
    return wrapper;
  }

  eq(other: HeadingWidget): boolean {
    return this.level === other.level;
  }
}

function leadingWhitespace(text: string): string {
  const match = text.match(/^( *)/);
  return match ? match[1] : "";
}

function isLineEmpty(text: string): boolean {
  return text.trim() === "";
}

function collectSelectedLineStarts(state: EditorState): Set<number> {
  const lineStarts = new Set<number>();

  for (const range of state.selection.ranges) {
    const startLine = state.doc.lineAt(range.from).number;
    const endLine = state.doc.lineAt(range.to).number;

    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
      lineStarts.add(state.doc.line(lineNumber).from);
    }
  }

  return lineStarts;
}

function mapLineStartsThroughChanges(
  lineStarts: ReadonlySet<number>,
  update: ViewUpdate,
): Set<number> {
  const mappedLineStarts = new Set<number>();

  for (const lineStart of lineStarts) {
    const mappedPos = update.changes.mapPos(lineStart, 1);
    const clampedPos = Math.min(mappedPos, update.state.doc.length);
    mappedLineStarts.add(update.state.doc.lineAt(clampedPos).from);
  }

  return mappedLineStarts;
}

function exitedLineStarts(update: ViewUpdate): Set<number> {
  if (!update.selectionSet && !update.docChanged) return new Set<number>();

  const previousSelection = collectSelectedLineStarts(update.startState);
  const previousLineStarts = update.docChanged
    ? mapLineStartsThroughChanges(previousSelection, update)
    : previousSelection;
  const currentLineStarts = collectSelectedLineStarts(update.state);
  const exited = new Set<number>();

  for (const lineStart of previousLineStarts) {
    if (!currentLineStarts.has(lineStart)) exited.add(lineStart);
  }

  return exited;
}

function buildDecorations(
  view: EditorView,
  animatedLineStarts: ReadonlySet<number> = new Set<number>(),
): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const selectedLineStarts = collectSelectedLineStarts(view.state);
  const seenLineStarts = new Set<number>();

  for (const visibleRange of view.visibleRanges) {
    let line = view.state.doc.lineAt(visibleRange.from);

    while (true) {
      if (!seenLineStarts.has(line.from)) {
        seenLineStarts.add(line.from);

        if (
          !selectedLineStarts.has(line.from) &&
          !isLineEmpty(line.text)
        ) {
          const whitespace = leadingWhitespace(line.text);
          const level = lineLevel(line.text);

          if (whitespace.length > 0 && level >= MIN_MARKER_LEVEL) {
            decorations.push(
              Decoration.replace({
                widget: new HeadingWidget(
                  level,
                  whitespace,
                  animatedLineStarts.has(line.from),
                ),
              }).range(line.from, line.from + whitespace.length),
            );
          }
        }
      }

      if (line.to >= visibleRange.to || line.number >= view.state.doc.lines) {
        break;
      }

      line = view.state.doc.line(line.number + 1);
    }
  }

  return Decoration.set(decorations, true);
}

export const headingMarkers = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged
      ) {
        const animatedLineStarts = update.selectionSet || update.docChanged
          ? exitedLineStarts(update)
          : new Set<number>();
        this.decorations = buildDecorations(update.view, animatedLineStarts);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
