## Layer 3: Mindmap Beauty + Theme Redesign

Final pass — strip 24 third-party themes to 3 hand-designed ones, refine mindmap visuals. Touches styles.css, main.ts, themes.ts, and package.json.

### Priority
2

### Type
epic

### Labels
theme, mindmap, visual, breaking

### Dependencies
blocks:layer-2-animations

### Acceptance Criteria
- Only 3 themes in picker (wd40 Dark, wd40 Light, TBD third)
- All @uiw/codemirror-theme-* dependencies removed from package.json
- Each theme has CodeMirror Extension, ChromeColors (16 props), branchColors (8 colors)
- Mindmap spacing is generous and links are visible
- Full app feels cohesive across all 3 themes
- Visual verification via `pnpm tauri dev`

---

## Strip third-party theme packages

Remove all @uiw/codemirror-theme-* dependencies and imports.

### Priority
1

### Type
task

### Description
- Remove ~16 `@uiw/codemirror-theme-*` dependencies from package.json
- Remove all third-party theme imports from themes.ts
- Remove all third-party theme entries from the THEMES array in themes.ts
- Delete `darkChrome()` and `lightChrome()` helper functions
- Run `pnpm install` to clean lockfile

### Design
Clearing the deck before designing new themes. darkChrome/lightChrome are replaced by inline ChromeColors per theme.

### Acceptance Criteria
- No @uiw/codemirror-theme-* in package.json or lockfile
- No third-party theme imports in themes.ts
- darkChrome() and lightChrome() deleted
- App still compiles (may have only 1-2 themes temporarily)

### Labels
theme, cleanup, dependencies

### Dependencies
blocks:layer-3-mindmap-themes

---

## Design 3 hand-crafted themes

Create 3 cohesive themes using /design-consultation or /design-shotgun with Stallman+Jobs+Ive sensibility.

### Priority
1

### Type
feature

### Description
Design and implement 3 themes, each with:
- CodeMirror Extension (syntax highlighting styles)
- ChromeColors (16 CSS custom properties)
- branchColors (8 mindmap link colors)

Themes:
1. **wd40 Dark** — warm dark, refine from current palette
2. **wd40 Light** — warm paper, refine from current palette
3. **TBD** — warm neutral/mid-tone or something unexpected from design process

Reference the parent design doc at `plans/wd40.md` for design context.

### Design
Use /design-consultation or /design-shotgun to explore. Start from existing wd40 dark/light as baseline. Each theme should feel hand-crafted, not generated. ChromeColors are inlined directly on each theme entry (no darkChrome/lightChrome helpers).

### Acceptance Criteria
- 3 visually distinct, cohesive themes
- Each theme defines all 16 ChromeColors properties
- Syntax highlighting is readable and aesthetically pleasing in each theme
- branchColors create a harmonious mindmap in each theme
- Themes feel "designed" not "generated"

### Labels
theme, design, creative

### Dependencies
blocks:strip-third-party-theme-packages

---

## Simplify theme picker and toggle

Replace optgroup picker with 3 flat options and cycle toggle.

### Priority
2

### Type
task

### Description
In main.ts:
- Lines 633-658: Remove optgroup logic, replace with 3 flat `<option>` elements
- Lines 597-598, 616-624: Remove `last-dark-theme`/`last-light-theme` localStorage keys
- Theme toggle button: cycle through themes (1 -> 2 -> 3 -> 1) instead of dark/light memory

### Design
With only 3 themes, grouping by dark/light is unnecessary overhead. Cycle toggle is simpler and more discoverable.

### Acceptance Criteria
- Theme picker shows 3 flat options (no groups)
- Toggle button cycles through all 3 themes
- No localStorage keys for last-dark/last-light
- Selected theme persists across app restart

### Labels
theme, ui, simplification

### Dependencies
blocks:design-3-hand-crafted-themes

---

## Markmap spacing adjustments

Increase markmap node spacing for more generous, readable layout.

### Priority
2

### Type
task

### Description
In main.ts (lines 154-161):
- `spacingVertical: 8` -> `12`
- `paddingX: 16` -> `20`

### Acceptance Criteria
- Mindmap nodes have more breathing room
- No node overlap at reasonable document sizes
- Layout still fits in panel at default width

### Labels
mindmap, spacing

### Dependencies
blocks:layer-3-mindmap-themes

---

## Markmap visual refinements

Adjust link opacity, stroke width, and font sizing for better mindmap aesthetics.

### Priority
2

### Type
task

### Description
In styles.css:
- Line 454: opacity 0.35 -> 0.45 (links more visible)
- Line 455: stroke-width 1.5px -> 1.8px (links slightly thicker)
- Line 432: 15px/22px -> 14px/20px (align with node override)
- Line 445: 15px/22px -> 14px/20px (align with node override)

### Design
Links were too faint — bumping opacity and stroke makes the tree structure more legible. Font size alignment prevents inconsistency between default markmap text and our overridden node text.

### Acceptance Criteria
- Mindmap links clearly visible against all 3 theme backgrounds
- Font sizes consistent between nodes and markmap defaults
- No visual regression on complex documents

### Labels
mindmap, visual

### Dependencies
blocks:layer-3-mindmap-themes
