/**
 * Level HUD — a tiny floating pill that appears when climbing levels.
 *
 * Shows current level during promotion. Type a digit to jump.
 * Type a letter to commit and start writing. Escape to dismiss.
 */

import { EditorView } from "@codemirror/view";

const HUD_ID = "level-hud";

let hudEl: HTMLElement | null = null;
let currentView: EditorView | null = null;
let visible = false;

function ensureHudElement(): HTMLElement {
  if (hudEl) return hudEl;

  hudEl = document.createElement("div");
  hudEl.id = HUD_ID;
  hudEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(hudEl);
  return hudEl;
}

function positionHud(view: EditorView) {
  const el = ensureHudElement();
  const { from } = view.state.selection.main;
  const coords = view.coordsAtPos(from);
  if (!coords) {
    el.style.display = "none";
    return;
  }

  el.style.position = "fixed";
  el.style.left = `${coords.left + 4}px`;
  el.style.top = `${coords.top - 28}px`;
}

export function showHud(view: EditorView, level: number) {
  currentView = view;
  const el = ensureHudElement();

  el.textContent = `${level}`;
  el.className = "level-hud level-hud-visible";
  positionHud(view);

  visible = true;
}

export function updateHud(level: number) {
  if (!visible || !hudEl) return;

  // Cross-fade the number
  hudEl.classList.add("level-hud-tick");
  requestAnimationFrame(() => {
    if (!hudEl) return;
    hudEl.textContent = `${level}`;
    hudEl.classList.remove("level-hud-tick");
  });

  if (currentView) positionHud(currentView);
}

export function hideHud() {
  if (!hudEl || !visible) return;
  visible = false;
  hudEl.className = "level-hud level-hud-hidden";

  // Remove from DOM after animation
  setTimeout(() => {
    if (hudEl && !visible) {
      hudEl.className = "level-hud";
      hudEl.style.display = "none";
    }
  }, 100);
}

export function isHudVisible(): boolean {
  return visible;
}
