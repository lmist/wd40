// Google Fonts monospace loader

export interface MonoFont {
  name: string;
  weight?: string; // default "400;700"
}

export const MONO_FONTS: MonoFont[] = [
  { name: "JetBrains Mono" },
  { name: "Fira Code" },
  { name: "Source Code Pro" },
  { name: "IBM Plex Mono" },
  { name: "Space Mono" },
  { name: "Inconsolata" },
  { name: "Roboto Mono" },
  { name: "Ubuntu Mono" },
  { name: "Noto Sans Mono" },
  { name: "Anonymous Pro" },
  { name: "PT Mono", weight: "400" },
  { name: "DM Mono" },
];

const SYSTEM_FONT = "System Default";
const STORAGE_KEY = "mono-font";

// Build Google Fonts CSS URL for a font
function googleFontUrl(font: MonoFont): string {
  const family = font.name.replace(/ /g, "+");
  const weights = font.weight ?? "400;700";
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

// Load a Google Font by injecting a <link> stylesheet
function loadFont(font: MonoFont): void {
  const id = `gfont-${font.name.replace(/\s/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = googleFontUrl(font);
  document.head.appendChild(link);
}

// Apply the mono font as a CSS custom property
function applyFont(fontName: string): void {
  const stack =
    fontName === SYSTEM_FONT
      ? '"SF Mono", "Menlo", monospace'
      : `"${fontName}", monospace`;
  document.documentElement.style.setProperty("--mono-font", stack);
}

// Get the saved font or default
export function getSavedFont(): string {
  return localStorage.getItem(STORAGE_KEY) ?? SYSTEM_FONT;
}

// Load and apply a font
export function setFont(fontName: string): void {
  localStorage.setItem(STORAGE_KEY, fontName);
  applyFont(fontName);

  if (fontName !== SYSTEM_FONT) {
    const font = MONO_FONTS.find((f) => f.name === fontName);
    if (font) {
      loadFont(font);
    }
  }
}

// Initialize: load saved font on startup
export function initFonts(): void {
  const saved = getSavedFont();
  applyFont(saved);

  if (saved !== SYSTEM_FONT) {
    const font = MONO_FONTS.find((f) => f.name === saved);
    if (font) {
      loadFont(font);
    }
  }
}

// Get all font names for the picker
export function getFontNames(): string[] {
  return [SYSTEM_FONT, ...MONO_FONTS.map((f) => f.name)];
}
