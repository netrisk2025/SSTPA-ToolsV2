# SSTPA Tools — UI design system ("Portfolio")

This document is the authoritative description of the GUI visual language.
It retains dual Light/Dark styles (gear-menu switch; style name `nocturne`
for Dark) while retuning surfaces toward a **turn-of-the-19th-century
architect's portfolio**: craft rather than high-tech. The earlier cool
"Instrument" brief is superseded where it contradicts this identity. The
SRS §6.2/§6.3 visual-identity clauses remain deliberately deviated from;
see `REQUIREMENTS-NOTES.md` I-17.

## Brief

SSTPA Tools is a desktop workbench for model-based system security
engineering. Its users are systems/security engineers spending long sessions
reading and editing a large typed graph. The UI's job is to make that graph
legible and its editing fast — presented as a **craft portfolio**, not a
neon console or a blank white SaaS shell.

- **Light** is parchment / dark cream (not white): warm paper, sepia ink,
  soft taupe lines.
- **Dark** is bluish-grey slate (not pure black): easy on the eyes, old-world
  rather than OLED.

## Principles

1. **Hierarchy from spacing and weight, not decoration.** Hairline borders
   and background steps are the only separators. Shadows exist only under
   true overlays (dialogs, tool windows, menus) and use warm sepia / deep
   slate veils rather than cold black.
2. **Ink acts, accent points.** Buttons and controls are ink-colored
   (neutral). The accent (deep ink-blue in Light; muted steel-blue in Dark)
   is reserved for *state*: selection, focus, the active thing. Brass /
   oxidized-copper (`accent-alt`) is secondary meta only.
3. **The HID is the signature.** The hierarchical identifier (`SYS_1_0`,
   `EL_1.2_4`) is always set in the mono face inside a quiet chip. The HID
   chip + node-type color tick encodes real information.
4. **Display serif is ceremonial.** Libre Baskerville (OFL, bundled) appears
   only on the branding wordmark and major headings. Body UI stays IBM Plex
   Sans; HIDs stay JetBrains Mono.
5. **The logo is ceremonial.** The heritage Art Nouveau logo appears only in
   the Product & License dialog. Chrome uses the geometric control-loop mark,
   used sparingly and small.

## Tokens

Semantic names (all `--sstpa-*`); values per style. Light is default; Dark
("nocturne") is the alternate selected from the gear menu.

### Surfaces & ink

| Token | Light (parchment) | Dark (bluish-grey) |
|---|---|---|
| `bg` (app background) | `#E8DCC8` | `#1A2330` |
| `surface` (cards, panels) | `#F3EBDD` | `#232D3C` |
| `inset` (wells, chips) | `#DFD2BC` | `#151C28` |
| `text` | `#2C2416` | `#E8E2D6` |
| `text-strong` | `#1F1810` | `#F5F0E6` |
| `muted` | `#6B5E4E` | `#A09B8E` |
| `line` (border) | `#C9BBA6` | `#3A4556` |
| `line-soft` (hairline) | `#DDD0BA` | `#2A3444` |

### Accent & status

| Token | Light | Dark |
|---|---|---|
| `accent` (selection/focus/active) | `#3D5A7A` | `#7B9BB5` |
| `accent-soft` | `#B7C4D4` | `#3A4E62` |
| `accent-alt` (secondary/meta, brass) | `#8A6B3E` | `#B8975A` |
| `status-ok` | `#2A6B45` | `#5AA87A` |
| `status-warn` | `#8A5A12` | `#D0A45A` |
| `status-error` | `#A63C3C` | `#D47A72` |
| `status-info` | `#2F5F8F` | `#7AABD4` |

### Graph / canvas

| Token | Light | Dark |
|---|---|---|
| `canvas` | `#EDE4D4` | `#171F2B` |
| `node-fill` | `#F7F1E6` | `#283344` |
| `node-stroke` | `#4A3F30` | `#D4CDC0` |
| `edge-stroke` | `#B5A890` | `#4A5568` |
| `selected` / `hover` | accent / accent-soft | same |

### Node-type categorical palette

Categorical node-type hues are retained from the prior validation pass
(CVD separation; badges and graph nodes still carry type names as text).
System/Element remain recessive structural slates. `node-muted` is warmed
slightly to sit on parchment / slate surfaces.

| Type token | Light | Dark |
|---|---|---|
| `node-system` | `#3D4E80` | `#94A5CE` |
| `node-element` | `#5F6B78` | `#94A0AD` |
| `node-function` | `#2276C7` | `#4A8FE0` |
| `node-interface` | `#128A65` | `#23997A` |
| `node-state` | `#7048B6` | `#9678E2` |
| `node-asset` | `#96660A` | `#B8891F` |
| `node-security` | `#C13434` | `#E2685F` |
| `node-purpose` | `#A0446E` | `#CE6E9C` |
| `node-environment` | `#5A7A28` | `#7CA13C` |
| `node-connection` | `#1E7CAB` | `#3E97CA` |
| `node-muted` | `#8B7F6E` | `#7A7368` |

Badges are tinted chips (12% type color background, type-color text), not
solid blocks — color identifies, text names.

### Type

- **UI face:** IBM Plex Sans 400/500/600 (OFL-1.1, bundled woff2).
- **Data face:** JetBrains Mono 400/700 (OFL-1.1, bundled) — HIDs, hosts,
  versions, model text.
- **Display face:** Libre Baskerville 400/700 (OFL-1.1, bundled woff2) via
  `--sstpa-font-display` — branding wordmark, drawer/tool titles, dialog
  headings, login wordmark only. Not used for body UI.
- Base 14px/1.5; section eyebrows 11px/600/0.08em uppercase in `muted`.
- Fonts are bundled for air-gapped use; no CDN at runtime.

### Geometry & motion

- Radius: 5px controls, 8px overlays (slightly softer than the prior
  Instrument geometry). Borders 1px; raised frames may use a subtle inset
  double-line (`box-shadow: inset 0 0 0 1px …`) for portfolio craft without
  layout breakage.
- Spacing scale unchanged (`sp-1..8`).
- Motion: 140/220ms, `cubic-bezier(0.2, 0, 0, 1)`; reduced-motion respected.
- Focus: 2px `accent` outline, offset 1px.

## Layout (unchanged IA, SRS §6.3)

Branding Panel → slim 48px bar: mark + wordmark left, status/user/icon
buttons right. Control Panel → 56px toolbar of icon+label buttons (SVG line
icons, 1.6px stroke — no emoji). SoI Panel → context strip with HID chips.
Main Panel → flat cards, hairline separation. Data Drawer → right sheet,
hairline + overlay shadow. Tool windows → floating surfaces, radius 8,
overlay shadow. Style switching remains in the gear menu (Light / Dark).

## Iconography

Single inline SVG set (`src/components/Icon.tsx`), 20×20 viewBox, stroke
`currentColor` 1.6, round caps/joins. Tool manifests reference icons by name.
The app/taskbar icon remains the flat control-loop mark on a rounded square
(accent-aligned indigo retained for mark recognition).

## Self-critique

Against failure modes: Light is deliberately *not* white SaaS and *not* a
return to terracotta Art Nouveau ornament — parchment + sepia ink + ink-blue
focus. Dark is deliberately *not* OLED black + acid accent — bluish slate
with warm off-white text and muted steel. Craft comes from paper/slate
surfaces, warmer shadows, a restrained display serif on wordmarks, and soft
geometry — not from decorative borders or gradients.
