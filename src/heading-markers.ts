import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { Range } from "@codemirror/state";

class HeadingWidget extends WidgetType {
  constructor(readonly level: number) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = `cm-heading-marker cm-heading-marker-${this.level}`;
    span.textContent = `H${this.level}`;
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  eq(other: HeadingWidget): boolean {
    return this.level === other.level;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];

  // Collect all lines that have a cursor/selection on them
  const cursorLines = new Set<number>();
  for (const range of view.state.selection.ranges) {
    const startLine = view.state.doc.lineAt(range.from).number;
    const endLine = view.state.doc.lineAt(range.to).number;
    for (let l = startLine; l <= endLine; l++) {
      cursorLines.add(l);
    }
  }

  syntaxTree(view.state).iterate({
    enter(node) {
      if (!node.name.startsWith("ATXHeading")) return;

      const levelChar = node.name.charAt(10);
      if (!levelChar) return;
      const level = parseInt(levelChar);
      if (level < 1 || level > 6) return;

      const line = view.state.doc.lineAt(node.from);

      // Skip if any cursor is on this line
      if (cursorLines.has(line.number)) return;

      // Find the HeaderMark child to get exact range of # characters
      let markEnd = -1;
      const cursor = node.node.cursor();
      if (cursor.firstChild()) {
        do {
          if (cursor.name === "HeaderMark") {
            markEnd = cursor.to;
            break;
          }
        } while (cursor.nextSibling());
      }

      if (markEnd === -1) return;

      // Include the space after the marks
      const afterMark = view.state.doc.sliceString(markEnd, markEnd + 1);
      const replaceEnd = afterMark === " " ? markEnd + 1 : markEnd;

      decorations.push(
        Decoration.replace({
          widget: new HeadingWidget(level),
        }).range(line.from, replaceEnd)
      );
    },
  });

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
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);
