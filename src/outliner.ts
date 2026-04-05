/**
 * Outliner extension for CodeMirror 6.
 *
 * Handles Tab, Shift+Tab, and Enter to manage indentation-based hierarchy.
 * Works with or without vim mode.
 */

import { EditorView, keymap } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";

const INDENT = "  "; // 2 spaces per level
const MAX_LEVEL = 6;
const MAX_INDENT = INDENT.repeat(MAX_LEVEL - 1); // 10 spaces = level 6

/** Get the indentation level (1-6) of a line based on leading spaces. */
export function lineLevel(lineText: string): number {
  const match = lineText.match(/^( *)/);
  const spaces = match ? match[1].length : 0;
  return Math.min(Math.floor(spaces / 2) + 1, MAX_LEVEL);
}

/** Get leading whitespace from a line. */
function leadingWhitespace(lineText: string): string {
  const match = lineText.match(/^( *)/);
  return match ? match[1] : "";
}

/** Check if a line is empty (only whitespace). */
function isLineEmpty(lineText: string): boolean {
  return lineText.trim() === "";
}

/**
 * Handle Tab key: indent the current line by one level.
 * Only acts at line start or on empty lines.
 */
function handleTab(view: EditorView): boolean {
  const { state } = view;
  const { from } = state.selection.main;
  const line = state.doc.lineAt(from);
  const ws = leadingWhitespace(line.text);
  const cursorInLeadingWs = from <= line.from + ws.length;

  // Only handle at line start / in leading whitespace, or on empty lines
  if (!cursorInLeadingWs && !isLineEmpty(line.text)) {
    return false; // let default handler (insert spaces) take over
  }

  const currentLevel = lineLevel(line.text);
  if (currentLevel >= MAX_LEVEL) return true; // no-op, at max depth

  // Insert 2 spaces at line start
  view.dispatch({
    changes: { from: line.from, to: line.from, insert: INDENT },
    selection: EditorSelection.cursor(from + INDENT.length),
  });
  return true;
}

/**
 * Handle Shift+Tab: dedent the current line by one level.
 */
function handleShiftTab(view: EditorView): boolean {
  const { state } = view;
  const { from } = state.selection.main;
  const line = state.doc.lineAt(from);
  const ws = leadingWhitespace(line.text);

  if (ws.length === 0) return true; // already at level 1, no-op

  // Remove up to 2 spaces from the start
  const removeCount = Math.min(INDENT.length, ws.length);
  view.dispatch({
    changes: { from: line.from, to: line.from + removeCount },
    selection: EditorSelection.cursor(Math.max(line.from, from - removeCount)),
  });
  return true;
}

export type ClimbCallback = (level: number) => void;

let onClimbStart: ClimbCallback | null = null;
let onClimbStep: ClimbCallback | null = null;
let onClimbEnd: (() => void) | null = null;
let climbing = false;

export function setClimbCallbacks(
  start: ClimbCallback,
  step: ClimbCallback,
  end: () => void,
) {
  onClimbStart = start;
  onClimbStep = step;
  onClimbEnd = end;
}

export function isClimbing(): boolean {
  return climbing;
}

export function endClimb() {
  if (climbing) {
    climbing = false;
    onClimbEnd?.();
  }
}

/**
 * Handle Enter key: level-aware newline behavior.
 *
 * - After content: new line at same indentation
 * - On empty line: promote up one level (remove one indent)
 * - On empty line at level 1: just insert a new level-1 line
 */
function handleEnter(view: EditorView): boolean {
  const { state } = view;
  const { from } = state.selection.main;
  const line = state.doc.lineAt(from);

  if (isLineEmpty(line.text)) {
    // Empty line: promote up one level
    const ws = leadingWhitespace(line.text);

    if (ws.length === 0) {
      // Already at level 1. End any climb and just insert a new line.
      endClimb();
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: "\n" },
        selection: EditorSelection.cursor(line.from + 1),
      });
      return true;
    }

    // Remove one level of indent (promote)
    const removeCount = Math.min(INDENT.length, ws.length);
    const newWs = ws.slice(removeCount);
    view.dispatch({
      changes: { from: line.from, to: line.to, insert: newWs },
      selection: EditorSelection.cursor(line.from + newWs.length),
    });

    const newLevel = lineLevel(newWs + "x"); // "x" so it's not empty
    if (!climbing) {
      climbing = true;
      onClimbStart?.(newLevel);
    } else {
      onClimbStep?.(newLevel);
    }

    // Auto-end climb at level 1
    if (newLevel <= 1) {
      endClimb();
    }

    return true;
  }

  // Non-empty line: new line at same indentation
  endClimb();
  const ws = leadingWhitespace(line.text);
  // Clamp indentation to MAX_LEVEL
  const clampedWs = ws.length > MAX_INDENT.length ? MAX_INDENT : ws;
  const insert = "\n" + clampedWs;
  view.dispatch({
    changes: { from, to: from, insert },
    selection: EditorSelection.cursor(from + insert.length),
  });
  return true;
}

/**
 * Handle digit input during climb mode.
 * Jumps up N levels from current position, clamped to level 1.
 * Returns true if the digit was consumed.
 */
export function handleClimbDigit(view: EditorView, digit: number): boolean {
  if (!climbing) return false;

  const { state } = view;
  const { from } = state.selection.main;
  const line = state.doc.lineAt(from);

  if (!isLineEmpty(line.text)) {
    endClimb();
    return false;
  }

  const currentLevel = lineLevel(line.text + "x");
  const targetLevel = Math.max(1, currentLevel - digit);
  const targetWs = INDENT.repeat(targetLevel - 1);

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: targetWs },
    selection: EditorSelection.cursor(line.from + targetWs.length),
  });

  if (targetLevel <= 1) {
    endClimb();
  } else {
    onClimbStep?.(targetLevel);
  }

  return true;
}

/**
 * The main outliner keymap extension.
 * Should be added with high precedence to override defaults.
 */
export const outlinerKeymap = keymap.of([
  { key: "Tab", run: handleTab },
  { key: "Shift-Tab", run: handleShiftTab },
  { key: "Enter", run: handleEnter },
]);
