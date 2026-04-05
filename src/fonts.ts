// Apple-native monospace fonts only

const APPLE_MONO_FONTS = ["SF Mono", "Menlo", "Monaco"] as const;
type AppleMonoFont = (typeof APPLE_MONO_FONTS)[number];

const STORAGE_KEY = "mono-font";
const DEFAULT_FONT: AppleMonoFont = "SF Mono";

function applyFont(fontName: string): void {
  const stack =
    fontName === "SF Mono"
      ? '"SF Mono", "Menlo"'
      : fontName === "Menlo"
        ? '"Menlo", "SF Mono"'
        : `"${fontName}", "SF Mono"`;
  document.documentElement.style.setProperty("--mono-font", stack);
}

export function getSavedFont(): string {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && (APPLE_MONO_FONTS as readonly string[]).includes(saved)) return saved;
  return DEFAULT_FONT;
}

export function setFont(fontName: string): void {
  localStorage.setItem(STORAGE_KEY, fontName);
  applyFont(fontName);
}

export function initFonts(): void {
  applyFont(getSavedFont());
}

export function getFontNames(): string[] {
  return [...APPLE_MONO_FONTS];
}
