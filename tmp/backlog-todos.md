## Custom markmap link shapes

Investigate custom bezier curves for markmap links to replace the mechanical d3 linkHorizontal default.

### Priority
3

### Type
feature

### Description
markmap-view uses d3-hierarchy's linkHorizontal internally. The current curves are functional but mechanical. Organic curves would make the mindmap feel more hand-drawn.

Options:
1. Contribute a `linkShape` option to markmap-view upstream
2. Fork markmap-view with custom bezier curve generation

### Design
This is exploratory work. Depends on Layer 3 completing first — spacing adjustments alone may fix the "mechanical" feel, making this unnecessary.

### Acceptance Criteria
- Prototype of custom link curves exists (upstream PR or local fork)
- Visual comparison: default curves vs custom curves
- Decision on upstream contribution vs fork

### Labels
mindmap, visual, exploration

### Dependencies
blocks:layer-3-mindmap-themes

---

## Test infrastructure setup

Add vitest and basic test coverage for theme lookup and Rust markdown parser.

### Priority
3

### Type
task

### Description
Set up vitest and write tests for:
- `getThemeById` — theme lookup by ID
- `applyChromeColors` — CSS custom property application
- Rust `parse_markdown` function
- Rust `parse_list` function

The Rust parser is the most complex code in the project with zero test coverage. A wrong parse tree = broken mindmap.

### Design
Use vitest for TypeScript tests. Rust tests use standard `#[cfg(test)]` modules. Start with happy-path tests, add edge cases incrementally.

### Acceptance Criteria
- vitest configured and running
- Theme lookup tests pass
- Rust parser tests cover basic markdown structures
- `pnpm test` runs all tests

### Labels
testing, infrastructure, quality
