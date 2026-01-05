# Design Tokens Registry

This registry defines the semantic tokens used by the UI. These tokens sit above
raw palette scales (verity/sand/ouro) and map to usage intent. Use these for new
components to keep the UI consistent and avoid palette drift.

## Color Tokens (HSL values)

Light:

- surface.base: `--surface-base` (sand-100)
- surface.raised: `--surface-raised` (white)
- surface.subtle: `--surface-subtle` (sand-50)
- surface.glass: `--surface-glass` (white, paired with blur)
- text.primary: `--text-primary` (foreground)
- text.secondary: `--text-secondary` (verity-600)
- text.muted: `--text-muted` (verity-500)
- text.inverse: `--text-inverse` (white)
- border.subtle: `--border-subtle` (sand-300)
- border.strong: `--border-strong` (sand-400)
- status.success: `--status-success` (verity-700)
- status.warning: `--status-warning` (ouro-500)
- status.danger: `--status-danger` (destructive)

Dark:

- surface.base: `--surface-base` (verity-950)
- surface.raised: `--surface-raised` (verity-900)
- surface.subtle: `--surface-subtle` (verity-800)
- surface.glass: `--surface-glass` (verity-900)
- text.primary: `--text-primary` (sand-100)
- text.secondary: `--text-secondary` (verity-300)
- text.muted: `--text-muted` (verity-400)
- text.inverse: `--text-inverse` (white)
- border.subtle: `--border-subtle` (verity-800)
- border.strong: `--border-strong` (verity-700)
- status.success: `--status-success` (verity-400)
- status.warning: `--status-warning` (ouro-500)
- status.danger: `--status-danger` (destructive)

## Typography Tokens

- display: Crimson Pro (headlines, KPIs)
- body: Inter (UI, dense text)
- numbers: Inter with tabular-nums for finance tables and KPIs

## Usage

Prefer CSS usage like:

- `color: hsl(var(--text-primary));`
- `background: hsl(var(--surface-base));`
- `border-color: hsl(var(--border-subtle));`

When using Tailwind, keep palette usage aligned with these semantics.
