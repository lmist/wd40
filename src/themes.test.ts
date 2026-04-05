import { describe, it, expect } from "vitest";
import { getThemeById, applyChromeColors, ChromeColors } from "./themes";

describe("getThemeById", () => {
  it("returns the correct theme for a valid ID", () => {
    const theme = getThemeById("wd40-dusk");
    expect(theme).toBeDefined();
    expect(theme!.id).toBe("wd40-dusk");
    expect(theme!.label).toBe("Dusk");
    expect(theme!.isDark).toBe(true);
  });

  it("returns the default wd40-dark theme", () => {
    const theme = getThemeById("wd40-dark");
    expect(theme).toBeDefined();
    expect(theme!.id).toBe("wd40-dark");
  });

  it("returns undefined for a missing ID", () => {
    const theme = getThemeById("nonexistent-theme");
    expect(theme).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    const theme = getThemeById("");
    expect(theme).toBeUndefined();
  });
});

describe("applyChromeColors", () => {
  it("sets all CSS custom properties on document.documentElement", () => {
    const chrome: ChromeColors = {
      bg: "#111111",
      bgSurface: "#222222",
      bgEditor: "#333333",
      fg: "#eeeeee",
      fgDim: "#aaaaaa",
      fgSecondary: "#888888",
      accent: "#ff0000",
      accentDim: "rgba(255, 0, 0, 0.1)",
      accentHover: "rgba(255, 0, 0, 0.2)",
      accentSecondary: "#00ff00",
      border: "#444444",
      statusbarBg: "#555555",
      toolbarBg: "#666666",
      toolbarBorder: "#777777",
      modeBg: "#880000",
      modeFg: "#ff8888",
      modeNormalBg: "#880000",
      modeNormalFg: "#ff8888",
      modeInsertBg: "#008800",
      modeInsertFg: "#88ff88",
      modeVisualBg: "#000088",
      modeVisualFg: "#8888ff",
    };

    applyChromeColors(chrome);

    const style = document.documentElement.style;
    expect(style.getPropertyValue("--bg")).toBe("#111111");
    expect(style.getPropertyValue("--bg-surface")).toBe("#222222");
    expect(style.getPropertyValue("--bg-editor")).toBe("#333333");
    expect(style.getPropertyValue("--fg")).toBe("#eeeeee");
    expect(style.getPropertyValue("--fg-dim")).toBe("#aaaaaa");
    expect(style.getPropertyValue("--fg-secondary")).toBe("#888888");
    expect(style.getPropertyValue("--accent")).toBe("#ff0000");
    expect(style.getPropertyValue("--accent-dim")).toBe("rgba(255, 0, 0, 0.1)");
    expect(style.getPropertyValue("--accent-hover")).toBe("rgba(255, 0, 0, 0.2)");
    expect(style.getPropertyValue("--accent-secondary")).toBe("#00ff00");
    expect(style.getPropertyValue("--border")).toBe("#444444");
    expect(style.getPropertyValue("--statusbar-bg")).toBe("#555555");
    expect(style.getPropertyValue("--toolbar-bg")).toBe("#666666");
    expect(style.getPropertyValue("--toolbar-border")).toBe("#777777");
    expect(style.getPropertyValue("--mode-bg")).toBe("#880000");
    expect(style.getPropertyValue("--mode-fg")).toBe("#ff8888");
  });

  it("works with a real theme's chrome colors", () => {
    const theme = getThemeById("wd40-light");
    expect(theme).toBeDefined();

    applyChromeColors(theme!.chrome);

    const style = document.documentElement.style;
    expect(style.getPropertyValue("--bg")).toBe(theme!.chrome.bg);
    expect(style.getPropertyValue("--accent")).toBe(theme!.chrome.accent);
  });
});
