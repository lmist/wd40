## Layer 3: Mindmap Beauty + Theme Redesign

### Priority
2

### Type
epic

### Description
Redesign from 24 third-party themes to 3 hand-crafted themes with Stallman+Jobs+Ive sensibility. Also refine markmap visual spacing and link opacity. Touches styles.css, main.ts, themes.ts, and package.json.

### Acceptance Criteria
- Only 3 themes in the picker, each visually distinct and handcrafted
- No @uiw/codemirror-theme-* packages remain in package.json
- Theme toggle cycles 1→2→3→1 (no dark/light memory logic)
- Markmap branch links are more visible, spacing feels generous
- `pnpm tauri dev` — full pass: switch themes, create tabs, resize, open modal, type markdown

### Labels
themes, styles, main.ts, themes.ts

---

## Design 3 Themes

### Priority
1

### Type
task

### Description
Run /design-consultation or /design-shotgun to design the 3 replacement themes. Start from existing wd40 dark/light palettes and refine with Stallman+Jobs+Ive sensibility.

- Theme 1: **wd40 Dark** — warm dark, starting from current dark palette
- Theme 2: **wd40 Light** — warm paper, starting from current light palette
- Theme 3: TBD — possibly warm neutral/mid-tone, or something unexpected from design process

Each theme needs: CodeMirror Extension (syntax highlighting), ChromeColors (16 properties), branchColors (8 colors).

### Design
Reference the parent design doc at plans/wd40.md for product sensibility. Use /design-consultation to understand the product before proposing palettes, or /design-shotgun to generate multiple variants for comparison.

### Acceptance Criteria
- 3 complete theme definitions documented (color values for all required properties)
- Each theme passes visual review: looks intentional, not generic
- Design rationale recorded for each theme

### Labels
themes, design

### Dependencies
blocks:layer-3-epic

---

## Strip Third-Party Theme Packages

### Priority
1

### Type
task

### Description
Remove all third-party @uiw/codemirror-theme-* packages and their code from the project:

- Remove ~16 `@uiw/codemirror-theme-*` entries from package.json dependencies
- Remove all third-party theme imports from themes.ts THEMES array
- Delete `darkChrome()` and `lightChrome()` helper functions from themes.ts
- Inline ChromeColors directly on each of the 3 remaining theme definitions

### Acceptance Criteria
- `package.json` contains no `@uiw/codemirror-theme-*` dependencies
- `pnpm install` completes without those packages
- No import errors from removed packages
- darkChrome/lightChrome helpers deleted (not just unused)

### Labels
themes, themes.ts, cleanup

### Dependencies
blocks:design-3-themes

---

## Simplify Theme Picker

### Priority
2

### Type
task

### Description
Replace optgroup-based theme picker with 3 flat options in main.ts (lines 633-658):

- Remove optgroup logic
- Replace with 3 `<option>` elements (one per theme)
- Theme toggle button: cycle through all 3 themes instead of dark/light memory
- Remove `last-dark-theme`/`last-light-theme` localStorage keys (lines 597-598, 616-624)
- Toggle cycles: Theme 1 → Theme 2 → Theme 3 → Theme 1

### Acceptance Criteria
- Theme picker shows exactly 3 options
- Toggle button cycles through all 3 in order, wrapping
- No localStorage keys for last-dark/last-light theme
- Previously saved last-dark/last-light values don't cause errors on load

### Labels
main.ts, themes

### Dependencies
blocks:strip-third-party-themes

---

## Markmap Spacing

### Priority
2

### Type
task

### Description
Increase markmap node spacing for a more generous, readable layout (main.ts:154-161):

- `spacingVertical: 8 → 12`
- `paddingX: 16 → 20`

### Acceptance Criteria
- Markmap nodes have more vertical breathing room
- Node text not clipped at horizontal edges

### Labels
main.ts, mindmap

### Dependencies
blocks:layer-3-epic

---

## Markmap Visual Refinements

### Priority
2

### Type
task

### Description
Increase branch link visibility and tighten base font sizing in styles.css (lines 432-483):

- Line 454: opacity 0.35 → 0.45 (branch links more visible)
- Line 455: stroke-width 1.5px → 1.8px (thicker links)
- Line 432: font 15px/22px → 14px/20px (base font, align with node override)
- Line 445: font 15px/22px → 14px/20px (node font, same)

### Acceptance Criteria
- Branch links visibly more prominent than before
- Font size change doesn't break node layout or overflow containers

### Labels
styles, mindmap

### Dependencies
blocks:layer-3-epic
