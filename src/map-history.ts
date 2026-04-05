export function rememberPreviousMap(
  activeMapId: string,
  nextMapId: string,
  previousMapId = "",
): string {
  if (!activeMapId || activeMapId === nextMapId) return previousMapId;
  return activeMapId;
}

export function swapToPreviousMap(
  activeMapId: string,
  previousMapId: string,
): { activeMapId: string; previousMapId: string } | null {
  if (!previousMapId || previousMapId === activeMapId) return null;
  return {
    activeMapId: previousMapId,
    previousMapId: activeMapId,
  };
}
