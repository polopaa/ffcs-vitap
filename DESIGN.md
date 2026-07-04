# Monochrome Timetable — Design Brief

## Direction
Pure monochrome editorial planner. Black ink on white (light), white ink on near-black (dark). No chroma anywhere — depth comes from lightness contrast, hairline borders, and pattern fills. The timetable grid dominates; everything else serves it.

## Tone
Modern, calm, high-contrast. Restraint over decoration. Type carries hierarchy — grotesque display for ceremony, neutral sans for clarity.

## Differentiation
No Bootstrap blue, no jewel tones, no gold. Strict grayscale forces legibility. Courses stay distinguishable via five gray swatches + three pattern fills (dots/stripes/grid) instead of color. Clash warnings invert contrast (black-on-white / white-on-black) rather than reaching for red.

## Color Palette

| Token | Light OKLCH | Dark OKLCH | Role |
| :--- | :--- | :--- | :--- |
| background | 1 0 0 | 0.13 0 0 | Canvas |
| foreground | 0.18 0 0 | 0.96 0 0 | Ink |
| card | 0.995 0 0 | 0.17 0 0 | Raised surface |
| primary | 0.18 0 0 | 0.98 0 0 | Active/CTA |
| secondary | 0.96 0 0 | 0.22 0 0 | Quiet surface |
| muted | 0.965 0 0 | 0.2 0 0 | Recessed zones |
| border | 0.9 0 0 | 0.26 0 0 | Hairline |
| destructive | 0.5 0 0 | 0.65 0 0 | Destructive (gray) |
| swatch-1 | 0.12 0 0 | 0.12 0 0 | Course (solid) |
| swatch-2 | 0.32 0 0 | 0.32 0 0 | Course (graphite) |
| swatch-3 | 0.5 0 0 | 0.5 0 0 | Course (mid) |
| swatch-4 | 0.68 0 0 | 0.68 0 0 | Course (silver) |
| swatch-5 | 0.82 0 0 | 0.82 0 0 | Course (light) |

## Typography
- Display: Bricolage Grotesque (200–800) — headings, brand, day labels.
- Body: DM Sans (300–700) — UI labels, slot text, side panel.
- Mono: Geist Mono — slot codes, combination strings, export.
- Tight tracking on display; ss01 + cv01 on body.

## Elevation & Depth
Layered shadows, never flat. `shadow-soft` for cards, `shadow-elevated` for the timetable grid and side panel. Hairline borders (1px) define edges instead of fills.

## Structural Zones

| Zone | Treatment | Priority |
| :--- | :--- | :--- |
| Timetable grid | Largest element, elevated card, hairline header | Primary — dominates screen |
| Side panel (add course) | Right rail, never overlays grid | Secondary |
| Credit selector + combination dropdown | Form controls in side panel | Secondary |
| Slot chips | Gray swatch + pattern fill + mono code | Tertiary |
| Clash inline notice | Inverted `.clash-surface` row, high-contrast border | Tertiary |
| Header/footer | Minimal, hairline divider | Quaternary |

## Spacing & Rhythm
8px base. Grid gutters 12px; cell padding 10px. Side panel width fixed ~360px so the grid keeps majority width. Generous whitespace around the grid frame.

## Component Patterns
- Course swatch chips: gray background + pattern overlay, contrasting label, soft shadow, rounded `--radius`.
- Add-course form: name input → credit selector (1/2/3/4) → combination dropdown filtered by credit → save.
- Combination dropdown: native select populated from slot-combinations data module by credit value; selecting fills grid cells automatically.
- Clash warning: inline `.clash-surface` row beneath the conflicting slot — no `alert()`.
- Editing a course loads its credit + combination back into the form.

## Motion
`fade-in` (280ms luxe easing) for panel and grid entries. `shimmer` reserved for loading placeholders. `--transition-luxe` (320ms) for surfaces, `--transition-smooth` (200ms) for micro-interactions. No bounce, no gratuitous motion.

## Constraints
- No drag-and-drop slot reassignment.
- No undo/redo.
- No browser alert dialogs for clashes — always inline.
- No manual cell-clicking on the grid — slots come only from the combination dropdown.
- No searchable/filterable dropdown (out of scope this build).
- No combination preview tooltip (out of scope this build).
- Print styles preserved: hide header/footer, keep `#timetable-grid`.

## Signature Detail
The timetable grid sits in an elevated card with a single hairline across its header row. Course cells read as monochrome inlays — solid black, graphite, mid-gray, silver, light-gray — each optionally overlaid with a dots/stripes/grid pattern so five courses never collapse into one visual. Clash cells invert: black ground, white ink, white rim.
