import { afterEach, describe, expect, it } from "vitest";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { headingMarkers } from "./heading-markers";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!("ResizeObserver" in globalThis)) {
  Object.assign(globalThis, { ResizeObserver: ResizeObserverStub });
}

const activeViews: EditorView[] = [];

function cursorSelection(pos: number): EditorSelection {
  return EditorSelection.create([EditorSelection.cursor(pos)]);
}

function rangeSelection(from: number, to: number): EditorSelection {
  return EditorSelection.create([EditorSelection.range(from, to)]);
}

function mountEditor(doc: string, selection: EditorSelection): EditorView {
  const host = document.createElement("div");
  host.style.width = "800px";
  host.style.height = "600px";
  document.body.appendChild(host);

  const view = new EditorView({
    state: EditorState.create({
      doc,
      selection,
      extensions: [
        headingMarkers,
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
    }),
    parent: host,
  });

  activeViews.push(view);
  return view;
}

function markerForLine(view: EditorView, lineNumber: number): HTMLElement | null {
  const line = view.dom.querySelector(`.cm-line:nth-child(${lineNumber})`);
  return line instanceof HTMLElement
    ? line.querySelector(".cm-heading-marker")
    : null;
}

function enterMarkers(view: EditorView): HTMLElement[] {
  return Array.from(view.dom.querySelectorAll(".cm-heading-marker-enter"));
}

afterEach(() => {
  while (activeViews.length > 0) {
    const view = activeViews.pop();
    view?.dom.parentElement?.remove();
    view?.destroy();
  }
});

describe("headingMarkers", () => {
  it("renders markers for inactive indented lines", () => {
    const view = mountEditor(
      "Root\n  Child\n    Grandchild",
      cursorSelection(0),
    );

    expect(markerForLine(view, 1)).toBeNull();
    expect(markerForLine(view, 2)?.classList.contains("cm-heading-marker-2")).toBe(true);
    expect(markerForLine(view, 3)?.classList.contains("cm-heading-marker-3")).toBe(true);
  });

  it("hides markers on the active selected line", () => {
    const view = mountEditor(
      "Root\n  Child\n    Grandchild",
      cursorSelection("Root\n  ".length),
    );

    expect(markerForLine(view, 2)).toBeNull();
    expect(markerForLine(view, 3)?.classList.contains("cm-heading-marker-3")).toBe(true);
  });

  it("derives marker levels from indentation rather than markdown syntax", () => {
    const view = mountEditor(
      "# Markdown heading\n  Child\n    Grandchild",
      cursorSelection(0),
    );

    expect(markerForLine(view, 1)).toBeNull();
    expect(markerForLine(view, 2)?.classList.contains("cm-heading-marker-2")).toBe(true);
    expect(markerForLine(view, 3)?.classList.contains("cm-heading-marker-3")).toBe(true);
  });

  it("animates only the line that exits selection", () => {
    const view = mountEditor(
      "Root\n  Child\n  Sibling",
      cursorSelection("Root\n  ".length),
    );

    view.dispatch({
      selection: cursorSelection("Root\n  Child\n  ".length),
    });

    expect(markerForLine(view, 2)?.classList.contains("cm-heading-marker-enter")).toBe(true);
    expect(markerForLine(view, 3)).toBeNull();
    expect(enterMarkers(view)).toHaveLength(1);
  });

  it("maps exited lines through document changes before animating", () => {
    const view = mountEditor(
      "Root\n  Child\n  Sibling",
      cursorSelection("Root\n  ".length),
    );
    const insert = "Intro\n";
    const movedSelection = view.state.doc.line(3).from + 1 + insert.length;

    view.dispatch({
      changes: { from: 0, insert },
      selection: cursorSelection(movedSelection),
    });

    expect(markerForLine(view, 3)?.classList.contains("cm-heading-marker-enter")).toBe(true);
    expect(markerForLine(view, 4)).toBeNull();
    expect(enterMarkers(view)).toHaveLength(1);
  });

  it("skips empty lines and level-1 lines", () => {
    const view = mountEditor(
      "Root\n\n  Child\n    ",
      cursorSelection(0),
    );

    expect(markerForLine(view, 1)).toBeNull();
    expect(markerForLine(view, 2)).toBeNull();
    expect(markerForLine(view, 3)?.classList.contains("cm-heading-marker-2")).toBe(true);
    expect(markerForLine(view, 4)).toBeNull();
  });

  it("animates every indented line leaving a multi-line selection", () => {
    const doc = "Root\n  One\n    Two\n  Three";
    const state = EditorState.create({ doc });
    const selection = rangeSelection(
      state.doc.line(2).from,
      state.doc.line(3).to,
    );
    const view = mountEditor(doc, selection);

    view.dispatch({
      selection: cursorSelection(view.state.doc.line(4).from + 1),
    });

    expect(markerForLine(view, 2)?.classList.contains("cm-heading-marker-enter")).toBe(true);
    expect(markerForLine(view, 3)?.classList.contains("cm-heading-marker-enter")).toBe(true);
    expect(markerForLine(view, 4)).toBeNull();
    expect(enterMarkers(view)).toHaveLength(2);
  });
});
