// Google Fonts monospace loader with caching

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
const CACHE_NAME = "google-fonts-v1";

// Build Google Fonts CSS URL for a font
function googleFontUrl(font: MonoFont): string {
  const family = font.name.replace(/ /g, "+");
  const weights = font.weight ?? "400;700";
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

// Fetch font CSS, resolve @font-face src URLs, and cache the font files
async function fetchAndCacheFont(font: MonoFont): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const cssUrl = googleFontUrl(font);

  // Check if we already cached this font's CSS
  const cachedCss = await cache.match(cssUrl);
  if (cachedCss) {
    const css = await cachedCss.text();
    ensureStyleSheet(font.name, css);
    return;
  }

  // Fetch the CSS (with woff2 user-agent to get modern format)
  const resp = await fetch(cssUrl, {
    headers: {
      // This UA string tells Google to serve woff2 format
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!resp.ok) throw new Error(`Failed to fetch font CSS for ${font.name}`);

  let css = await resp.text();

  // Extract all font file URLs from the CSS and cache them
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  const fontUrls: string[] = [];
  let match;
  while ((match = urlRegex.exec(css)) !== null) {
    fontUrls.push(match[1]);
  }

  // Fetch and cache all font files in parallel
  await Promise.all(
    fontUrls.map(async (url) => {
      const cached = await cache.match(url);
      if (!cached) {
        const fontResp = await fetch(url);
        if (fontResp.ok) {
          await cache.put(url, fontResp);
        }
      }
    })
  );

  // Cache the CSS itself
  await cache.put(cssUrl, new Response(css, { headers: { "Content-Type": "text/css" } }));

  ensureStyleSheet(font.name, css);
}

// Inject a <style> element for the font's @font-face rules
function ensureStyleSheet(fontName: string, css: string): void {
  const id = `gfont-${fontName.replace(/\s/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
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
export async function setFont(fontName: string): Promise<void> {
  localStorage.setItem(STORAGE_KEY, fontName);
  applyFont(fontName);

  if (fontName !== SYSTEM_FONT) {
    const font = MONO_FONTS.find((f) => f.name === fontName);
    if (font) {
      await fetchAndCacheFont(font);
    }
  }
}

// Initialize: load saved font on startup
export async function initFonts(): Promise<void> {
  const saved = getSavedFont();
  applyFont(saved);

  if (saved !== SYSTEM_FONT) {
    const font = MONO_FONTS.find((f) => f.name === saved);
    if (font) {
      try {
        await fetchAndCacheFont(font);
      } catch (e) {
        console.warn("Failed to load cached font, falling back to system:", e);
      }
    }
  }
}

// Get all font names for the picker
export function getFontNames(): string[] {
  return [SYSTEM_FONT, ...MONO_FONTS.map((f) => f.name)];
}
