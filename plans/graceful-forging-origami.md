# Eng Review: wd40 Premium Pass — "Cupertino Solace"

## Context

wd40 is a Tauri v2 markdown editor + live mindmap. The architecture and features are done. This plan implements a 4-layer visual refinement pass plus a theme redesign: strip 24 third-party themes down to 3 hand-designed ones, then refine typography, animations, mindmap beauty, and chrome details.

Read if you need:
Design doc: `~/.gstack/projects/lmist-wd40/lou-lmist-kyoto-design-20260404-002601.md`

## Scope

3 files: `src/styles.css`, `src/main.ts`, `src/themes.ts`
Also: `package.json` (remove ~16 `@uiw/codemirror-theme-*` deps), `src/theme.ts` (keep — custom theme definitions)
No new features. No new files.

**Scope change from design doc:** 24 themes → max 3 hand-designed themes. Third-party theme packages removed. Use /design-consultation or /design-shotgun to create the 3 themes with Stallman+Jobs+Ive sensibility.

## Implementation Order: 1 → 4 → 2 → 3

Layer 1 (spacing grid) → Layer 4 (chrome polish) → Layer 2 (animations) → Layer 3 (mindmap + theme redesign)

Polish the still frame first, then add motion.

## Review Decisions

- **No `@property` declarations** — skip chrome color transitions. Editor opacity fade only. Simpler.
- **Delete `darkChrome`/`lightChrome` helpers** — with 3 themes, inline ChromeColors directly.
- **Simplify theme picker** — 3 flat `<option>` elements, cycle toggle instead of dark/light memory.
- **No tests** — visual verification via `pnpm tauri dev`.
- **150ms debounce** (up from 50ms) on markmap updates, to give 300ms D3 transitions room.

---

## Layer 1: Typography & Spacing (styles.css only)

### 4px Grid Alignment

```
CURRENT → PROPOSED
────────────────────────────────────────────
styles.css:73   gap: 2px           → gap: 4px          (tab bar)
styles.css:72   padding: 0 8px 0 78px → 0 8px 0 80px   (traffic light offset)
styles.css:88   padding: 2px 10px  → 4px 8px           (tab buttons)
styles.css:184  gap: 2px           → gap: 4px           (toolbar)
styles.css:226  padding: 0 14px    → 0 16px             (statusbar)
styles.css:227  gap: 10px          → gap: 12px          (statusbar)
styles.css:123  padding: 1px 8px   → 2px 8px            (resize badge)
styles.css:299  margin-right: 6px  → 8px                (heading markers)
styles.css:307  padding: 2px 6px   → 2px 8px            (H1 marker)
styles.css:314  padding: 2px 5px   → 2px 8px            (H2 marker)
styles.css:551  padding: 14px 18px → 16px 20px           (vimrc header)
styles.css:585  padding: 14px 18px → 16px 20px           (vimrc editor)
styles.css:602  padding: 12px 18px → 12px 20px           (vimrc footer)
```

### Heading Marker Minimum Font Size (11px floor)

H3 (line 320): 9px → 11px, padding 1px 4px → 2px 4px
H4 (line 328): 8px → 11px, padding 1px 4px → 2px 4px
H5 (line 336): 8px → 11px, padding 1px 3px → 2px 4px
H6 (line 343): 7px → 11px, padding 1px 3px → 2px 4px

Hierarchy preserved via opacity (H4=0.7, H5=0.5, H6=0.4).

---

## Layer 4: Chrome & Details (styles.css only)

### Tab bar — physical tabs (styles.css:81-98)

```css
#tab-bar button {
  border-radius: 6px 6px 0 0;  /* was: 4px */
  padding: 4px 12px;
  margin-top: 2px;
}
#tab-bar button.active {
  background: var(--bg-editor);  /* was: var(--accent-dim) */
  color: var(--fg);
  margin-top: 0;
  padding-top: 6px;             /* grows upward 2px */
}
```

### Divider grab affordance (styles.css:144-163)

```css
#divider {
  transition: background 0.2s ease, width 0.15s ease;
}
#divider:hover, #divider.dragging {
  background: var(--accent);
  width: 3px;
  margin: 0 -1px;  /* prevent layout shift */
}
```

### Statusbar (styles.css:246-248)

Add `line-height: 1` to `#file-name`.

---

## Layer 2: Animations & Transitions (styles.css + main.ts)

### 2a. Theme switch editor fade (main.ts:588-613)

In `setThemeById()`:
```typescript
editorPane.style.transition = "opacity 150ms ease";
editorPane.style.opacity = "0.6";
requestAnimationFrame(() => {
  editor.dispatch({ effects: themeCompartment.reconfigure(entry.extension) });
  applyMarkmapTheme();
  updateMarkmap(editor.state.doc.toString());
  requestAnimationFrame(() => { editorPane.style.opacity = "1"; });
});
```

### 2b. Tab switch fade (main.ts:264-280)

Same pattern — fade to 0.5, swap content, fade back. 100ms ease.

### 2c. Modal animation (styles.css:520-534)

Replace display:none with opacity + pointer-events + transform:
```css
.vimrc-overlay { opacity: 1; transition: opacity 200ms ease-out; }
.vimrc-overlay.hidden { opacity: 0; pointer-events: none; }
.vimrc-modal { transform: scale(1) translateY(0); transition: transform 200ms ease-out; }
.vimrc-overlay.hidden .vimrc-modal { transform: scale(0.97) translateY(4px); }
```

No JS changes — existing classList toggle works.

### 2d. Markmap animation duration (main.ts:154-161)

Add `duration: 300` to markmap options. Set `(mm as any).options.duration = 300` after creation as fallback.

### 2e. Debounce increase (main.ts:197)

`debounce(…, 50)` → `debounce(…, 150)` — gives 300ms transitions room to breathe.

### 2f. Panel resize elastic snap-back (main.ts:556-578)

During drag: allow below 200px with 0.3x rubber-band resistance.
On mouseup: animate to clamped value with `cubic-bezier(0.34, 1.56, 0.64, 1)`.
Clear transition after snap-back completes.

---

## Layer 3: Mindmap Beauty + Theme Redesign (styles.css + main.ts + themes.ts + package.json)

### 3a. Theme Redesign — 24 → 3

**Strip out:** All `@uiw/codemirror-theme-*` imports and packages.
- Remove ~16 dependencies from `package.json`
- Remove all third-party theme entries from `themes.ts` THEMES array
- Delete `darkChrome()` and `lightChrome()` helper functions
- Inline ChromeColors on each of the 3 remaining themes

**Design 3 themes** using /design-consultation or /design-shotgun:
- Theme 1: **wd40 Dark** — warm dark (current palette is the starting point, refine)
- Theme 2: **wd40 Light** — warm paper (current palette is the starting point, refine)
- Theme 3: TBD — possibly a warm neutral/mid-tone, or something unexpected from the design process

Each theme needs: CodeMirror Extension (syntax highlighting), ChromeColors (16 properties), branchColors (8 colors).

**Simplify theme picker** (main.ts:633-658):
- Remove optgroup logic, replace with 3 flat options
- Theme toggle button: cycle through 3 themes instead of dark/light memory

**Simplify theme state** (main.ts:597-598, 616-624):
- Remove `last-dark-theme`/`last-light-theme` localStorage keys
- Toggle cycles: Theme 1 → 2 → 3 → 1

### 3b. Markmap spacing (main.ts:154-161)

`spacingVertical: 8 → 12`, `paddingX: 16 → 20`

### 3c. Markmap visual refinements (styles.css:448-483)

```
Line 454: opacity: 0.35 → 0.45
Line 455: stroke-width: 1.5px → 1.8px
Line 432: 15px/22px → 14px/20px  (align with node override)
Line 445: 15px/22px → 14px/20px
```

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| markmap `duration` ignored by `setData` | Medium | Set on instance directly after creation |
| Tab bar 28px overflow with physical tabs | Low | Keep button height ≤24px, test with 3+ tabs |
| Divider negative margin layout shift | Low | Test at various widths |
| Theme design takes longer than expected | Medium | Start from existing wd40 dark/light palettes, refine |

## What Already Exists (reuse these)
- `applyChromeColors()` in themes.ts:429-447 — sets CSS custom properties
- `src/theme.ts` — custom CodeMirror theme + highlight style definitions (keep and evolve)
- Existing transitions on buttons, pickers, divider in styles.css
- markmap node/link opacity transitions (styles.css:480-483)
- Panel resize min-width clamping (main.ts:384-391)

## Failure Modes

| Codepath | Failure | Test? | Error handling? | User sees? |
|----------|---------|-------|-----------------|------------|
| Theme switch fade | rAF not firing (backgrounded tab) | No | No | Theme swaps without fade — acceptable |
| Modal opacity 0 + pointer-events:none | Click-through on old browsers | No | No | Could interact with content behind modal — unlikely on Tauri WebKit |
| Markmap duration | d3 transition overlap on fast typing | No | d3 interrupts prev transition | Nodes jump to final position — acceptable |
| Elastic snap-back | Transition not clearing after snap | No | Use transitionend listener | Panel stuck with transition on future drags — needs cleanup |

No critical gaps. All failures degrade gracefully.

## Parallelization

All layers share `styles.css`. **Sequential implementation, no parallelization opportunity.**

## Verification

1. `pnpm tauri dev` after each layer
2. **Layer 1:** DevTools audit — all spacing on 4px grid, heading markers legible
3. **Layer 4:** Active tab connects to editor pane, divider widens on hover, 3+ tabs don't overflow
4. **Layer 2:** Theme switch fades smoothly, tab switch fades, modal scales in/out, mindmap nodes animate, panel snaps back elastically
5. **Layer 3:** Only 3 themes in picker, each looks handcrafted, branch links visible, mindmap spacing generous
6. **Full pass:** Open app, switch themes, create tabs, resize panes, open modal, type markdown. Should feel like butter.


# TODOS (not yet decomposed)

1. **Custom markmap link shapes** Investigate contributing a `linkShape` option to markmap-view upstream, or fork with custom bezier curve generation. The current curves are functional but mechanical. Organic curves would make the mindmap feel more hand-drawn. markmap-view uses d3-hierarchy's linkHorizontal internally. Depends on Layer 3 of the premium pass completing first, to see if spacing adjustments alone fix the feel.

2. **Test infrastructure** Add vitest + basic tests for theme lookup (`getThemeById`, `applyChromeColors`) and Rust `parse_markdown`/`parse_list` functions. The Rust parser is the most complex code in the project with zero test coverage. A wrong parse tree = broken mindmap.


## Completion Summary

- Parallelization: 1 lane, sequential
