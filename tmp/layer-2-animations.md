## Layer 2: Animations & Transitions

Third pass — add motion. Theme fade, tab fade, modal animation, markmap transitions, debounce tuning, elastic panel snap-back. Touches styles.css and main.ts.

### Priority
2

### Type
epic

### Labels
animation, motion, polish

### Dependencies
blocks:layer-4-chrome-details

### Acceptance Criteria
- Theme switch fades smoothly (no flash)
- Tab switch fades smoothly
- Modal scales in/out with opacity
- Markmap nodes animate with 300ms duration
- Panel snaps back elastically from under-minimum drag
- All animations degrade gracefully (skip without breaking)
- Visual verification via `pnpm tauri dev`

---

## Theme switch editor fade

Fade editor opacity during theme switch to avoid flash of unstyled content.

### Priority
2

### Type
task

### Description
In main.ts `setThemeById()` (lines 588-613):

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

### Design
Double rAF ensures the browser paints the dimmed state before reconfiguring. If rAF doesn't fire (backgrounded tab), theme swaps without fade — acceptable degradation.

### Acceptance Criteria
- Editor dims briefly during theme switch
- No flash of unstyled content
- Works across all 3 themes

### Labels
animation, theme

### Dependencies
blocks:layer-2-animations

---

## Tab switch fade

Fade editor during tab switch for smooth content swap.

### Priority
2

### Type
task

### Description
In main.ts (lines 264-280), apply same fade pattern as theme switch but with opacity 0.5 and 100ms ease timing.

### Design
Shorter duration than theme switch (100ms vs 150ms) because tab switches are more frequent and need to feel snappy.

### Acceptance Criteria
- Editor fades to 0.5 and back on tab switch
- Content swap is invisible (happens during dim)
- No perceptible delay on fast tab cycling

### Labels
animation, tabs

### Dependencies
blocks:layer-2-animations

---

## Modal animation (CSS opacity + scale)

Replace display:none toggle with opacity + pointer-events + transform for smooth modal in/out.

### Priority
2

### Type
task

### Description
In styles.css (lines 520-534), replace display-based show/hide with:

```css
.vimrc-overlay { opacity: 1; transition: opacity 200ms ease-out; }
.vimrc-overlay.hidden { opacity: 0; pointer-events: none; }
.vimrc-modal { transform: scale(1) translateY(0); transition: transform 200ms ease-out; }
.vimrc-overlay.hidden .vimrc-modal { transform: scale(0.97) translateY(4px); }
```

No JS changes needed — existing classList toggle works.

### Design
Scale + translateY gives a subtle "dropping in from above" feel. pointer-events:none replaces display:none for hiding. Old browsers that don't support pointer-events could allow click-through, but Tauri WebKit supports it.

### Acceptance Criteria
- Modal fades and scales in on open
- Modal fades and scales out on close
- No interaction with content behind hidden modal
- Existing keyboard shortcuts still work

### Labels
animation, modal

### Dependencies
blocks:layer-2-animations

---

## Markmap animation duration

Set 300ms transition duration on markmap node updates.

### Priority
2

### Type
task

### Description
In main.ts (lines 154-161):
- Add `duration: 300` to markmap options object
- Set `(mm as any).options.duration = 300` after creation as fallback

### Design
300ms gives smooth node repositioning. d3 interrupts previous transitions on fast typing, so nodes jump to final position — acceptable.

### Acceptance Criteria
- Markmap nodes animate smoothly on content change
- No visual stutter on fast typing (d3 interruption is fine)

### Labels
animation, mindmap

### Dependencies
blocks:layer-2-animations

---

## Debounce increase 50ms to 150ms

Increase markmap update debounce to give transitions room to complete.

### Priority
2

### Type
task

### Description
In main.ts (line 197), change `debounce(..., 50)` to `debounce(..., 150)`.

### Design
150ms debounce + 300ms transition duration means transitions have room to breathe. Typing still feels responsive — 150ms is below the perception threshold for "laggy" feedback.

### Acceptance Criteria
- Markmap updates feel smooth, not jittery
- Typing still feels responsive
- No perceptible delay in mindmap updates

### Labels
animation, mindmap, performance

### Dependencies
blocks:layer-2-animations

---

## Panel resize elastic snap-back

Add rubber-band resistance below minimum width and elastic snap-back animation.

### Priority
2

### Type
task

### Description
In main.ts (lines 556-578):

During drag: allow below 200px minimum with 0.3x rubber-band resistance factor.
On mouseup: animate to clamped value with `cubic-bezier(0.34, 1.56, 0.64, 1)` easing.
Clear transition after snap-back completes via transitionend listener.

### Design
Rubber-band resistance (0.3x) gives tactile feedback that you're past the limit. Overshoot cubic-bezier creates a physical "snap" feel. transitionend cleanup prevents the transition from interfering with future drags.

Failure mode: if transitionend doesn't fire, panel gets stuck with transition on future drags. Use a fallback setTimeout(300ms) cleanup.

### Acceptance Criteria
- Dragging below minimum shows resistance (panel moves slower)
- Releasing below minimum snaps back with elastic animation
- Future drags after snap-back work normally (transition cleared)
- Works at various window widths

### Labels
animation, interaction, panel

### Dependencies
blocks:layer-2-animations
