import { afterEach, describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdownHeadingInput } from "./markdown-heading-input";

const activeViews: EditorView[] = [];

function mountEditor(doc = ""): EditorView {
  const host = document.createElement("div");
  document.body.appendChild(host);

  const view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: [markdownHeadingInput],
    }),
    parent: host,
  });

  activeViews.push(view);
  return view;
}

afterEach(() => {
  while (activeViews.length > 0) {
    const view = activeViews.pop();
    view?.dom.parentElement?.remove();
    view?.destroy();
  }
});

describe("markdownHeadingInput", () => {
  it("converts pasted markdown headings into indentation", () => {
    const view = mountEditor();

    view.dispatch({
      changes: {
        from: 0,
        insert: "# Osaka\n## Kyoto\n### Lima",
      },
    });

    expect(view.state.doc.toString()).toBe("Osaka\n  Kyoto\n    Lima");
  });

  it("converts a line-start heading into outliner text", () => {
    const view = mountEditor();

    view.dispatch({
      changes: {
        from: 0,
        insert: "## Nairobi",
      },
    });

    expect(view.state.doc.toString()).toBe("  Nairobi");
  });

  it("leaves hashes alone away from the line start", () => {
    const view = mountEditor();

    view.dispatch({
      changes: {
        from: 0,
        insert: "Osaka # Kyoto",
      },
    });

    expect(view.state.doc.toString()).toBe("Osaka # Kyoto");
  });
});
