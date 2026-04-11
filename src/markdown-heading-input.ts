import { ChangeDesc, ChangeSpec, EditorState, Text } from "@codemirror/state";
import { markdownHeadingToIndentedLine } from "./transform";

function touchedLineStarts(doc: Text, changes: ChangeDesc): number[] {
  const lineStarts = new Set<number>();

  changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
    const endPos = toB > fromB ? toB - 1 : fromB;
    const startLine = doc.lineAt(fromB);
    const endLine = doc.lineAt(endPos);

    for (let lineNumber = startLine.number; lineNumber <= endLine.number; lineNumber += 1) {
      lineStarts.add(doc.line(lineNumber).from);
    }
  });

  return [...lineStarts].sort((left, right) => left - right);
}

export function markdownHeadingInputChanges(doc: Text, changes: ChangeDesc): ChangeSpec[] {
  const replacements: ChangeSpec[] = [];

  for (const lineStart of touchedLineStarts(doc, changes)) {
    const line = doc.lineAt(lineStart);
    const normalized = markdownHeadingToIndentedLine(line.text);

    if (normalized === null || normalized === line.text) continue;

    replacements.push({ from: line.from, to: line.to, insert: normalized });
  }

  return replacements;
}

export const markdownHeadingInput = EditorState.transactionFilter.of((transaction) => {
  if (!transaction.docChanged) return transaction;

  const replacements = markdownHeadingInputChanges(
    transaction.newDoc,
    transaction.changes,
  );

  if (replacements.length === 0) return transaction;

  return [transaction, { changes: replacements, sequential: true }];
});
