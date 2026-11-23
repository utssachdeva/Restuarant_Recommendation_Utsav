---
name: Warm Editorial Dining
colors:
  surface: '#fff8f4'
  surface-dim: '#e0d9d4'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ed'
  surface-container: '#f4ece7'
  surface-container-high: '#eee7e2'
  surface-container-highest: '#e8e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#59413c'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f7efea'
  outline: '#8d706b'
  outline-variant: '#e1bfb8'
  surface-tint: '#af3019'
  primary: '#ab2d17'
  on-primary: '#ffffff'
  primary-container: '#cd462d'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a5'
  secondary: '#52634c'
  on-secondary: '#ffffff'
  secondary-container: '#d5e8cb'
  on-secondary-container: '#586952'
  tertiary: '#5e5c57'
  on-tertiary: '#ffffff'
  tertiary-container: '#76746f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#8d1703'
  secondary-fixed: '#d5e8cb'
  secondary-fixed-dim: '#b9ccb0'
  on-secondary-fixed: '#101f0d'
  on-secondary-fixed-variant: '#3b4b36'
  tertiary-fixed: '#e6e2db'
  tertiary-fixed-dim: '#cac6bf'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#484742'
  background: '#fff8f4'
  on-background: '#1e1b18'
  surface-variant: '#e8e1dc'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system embodies an unhurried, editorial dining journal tailored to Bangalore’s vibrant culinary landscape. It deliberately rejects the noisy, gamified, and neon-saturated paradigms of conventional food delivery apps in favor of an intimate, curated experience reminiscent of an independent food publication or a sommelier’s personal notebook.

The emotional target is calm discovery, discerning taste, and unforced warmth. The visual aesthetic fuses contemporary editorial layout with tactile print minimalism: generous negative space, deliberate typographic tension, hairline framing, and tactile warm paper tones. Visuals emphasize natural photography, local ingredient provenance, and contextual dining ambience over high-intensity promotional banners.

## Colors
The palette is calibrated strictly for light mode, drawing inspiration from handmade parchment, terracotta roof tiles, and South Indian garden foliage.

- **Canvas & Surfaces**: The base canvas is `#F9F8F5` (warm cream/paper), providing a soft, non-glare foundation. Card elevated surfaces use crisp `#FFFFFF` to bring layered definition without harsh contrast.
- **Primary Accent (`#D94E34`)**: A grounded, sun-baked terracotta red. Reserved exclusively for primary conversion points, active indicators, and high-priority recommendation tags. It is never applied to large surface fills.
- **Secondary Accent (`#5A6B54`)**: A subdued dry olive/sage. Utilized for organic dietary markers, seasonal notes, curated collection accents, and subtle secondary highlights.
- **Structural Outlines (`#EAE6DF` / `#ECE7DF`)**: Thin, structural borders that govern visual structure without creating visual weight.
- **Typography & Neutrals**: Primary text and headlines command `#24211E` (rich roasted espresso/charcoal) for optimal readability and literary presence. Supporting meta-copy and timestamps render in `#76726B` (warm muted grey).

## Typography
Typographic rhythm sets the identity of the system. We balance literary warmth with utilitarian efficiency by pairing **Newsreader** for expressive editorial weight and **Plus Jakarta Sans** for functional precision.

- **Editorial Serifs (`Newsreader`)**: Headlines, featured venue titles, neighborhood introductions, and curate summaries utilize Newsreader with natural optical sizing. It brings an intellectual, leisurely character to dining critique and AI commentary.
- **Humanist Sans (`Plus Jakarta Sans`)**: Body copy, dietary tags, filters, ratings, and navigation adhere to Plus Jakarta Sans. Its balanced geometry ensures effortless legibility across dense ingredient breakdowns and neighborhood maps.
- **Case & Tracking**: Uppercase styling is applied exclusively to small metadata tokens (`label-sm`), styled with subtle letter spacing (`0.06em`) to preserve legibility without aggressiveness.

## Layout & Spacing
The layout follows a responsive fluid grid that prioritizes breathing space and intentional composition.

- **Breakpoints & Grid Architecture**:
  - **Mobile (< 768px)**: 4-column layout. Margin is `1.25rem` (`margin`) with a `1rem` (`gutter`) channel. Content arranges in vertical editorial scrolls and horizontal carousels.
  - **Tablet (768px – 1024px)**: 8-column layout. Margin expands to `2rem`, gutter stays at `1.25rem`.
  - **Desktop (> 1024px)**: 12-column layout with a maximum container width of `1280px`. Margin widens to `3rem` (`margin-desktop`) with a `2rem` (`gutter-desktop`) channel.
- **Spatial Rhythm**: The layout leans heavily into generous vertical margins (`space-xl` and above) between distinct content modules (e.g., separating AI sensory insights from venue metadata). Padding inside containers relies strictly on `space-md` or `space-lg`, ensuring cards never appear claustrophobic.

## Elevation & Depth
This design system rejects synthetic drop shadows, floating skeuomorphism, and translucent blurs. Visual separation is accomplished through planar layering and deliberate line work:

- **Tonal Contrast**: The canvas (`#F9F8F5`) sits behind elevated white surface cards (`#FFFFFF`). The subtle shift between warm cream and white produces natural depth without cast shadows.
- **Hairline Framing**: Surfaces and dividers rely on 1px solid borders (`#ECE7DF`). Nested cards employ `#EAE6DF` for subtle visual containment.
- **Hover & Interaction States**: Rather than lifting an element with a shadow on pointer hover, interactive components transition their border to `#D94E34` at 40% opacity or shift background tone from `#FFFFFF` to `#F4F0E8` with a 200ms ease curve.
- **Modals & Drawers**: Backdrop overlays avoid pure blacks, using `#24211E` at 35% opacity. Bottom sheets and popovers feature a hairline border on open edges with a faint, diffused ambient tone (`rgba(36, 33, 30, 0.04)` blur 12px, offset 0px 4px) to retain contrast over rich imagery.

## Shapes
The shape language favors architectural composure: tailored, soft corners that evoke high-end stationery, menu jackets, and editorial spreads rather than bubbly app conventions.

- **Standard Elements**: Text fields, venue cards, and primary buttons use standard `roundedness: 1` (`0.25rem` / 4px).
- **Secondary Surfaces & Containers**: Detail cards, filter sheets, and contextual review blocks use `rounded-lg` (`0.5rem` / 8px).
- **No Pill Capsules**: Rounded pill buttons are avoided in favor of crisp architectural boxes with restrained corner radii, reinforcing a sophisticated print-inspired visual cadence.

## Components

### Buttons
- **Primary Button**: Solid terracotta `#D94E34` background with `#FFFFFF` text. Flat, borderless, corner radius 4px (`roundedness: 1`), padding `10px 20px`. Typography is `label-md`. Hover state shifts tone to `#BF3E26`.
- **Secondary Button**: Crisp `#FFFFFF` surface with a 1px solid `#ECE7DF` border and `#24211E` text. On hover, border shifts to `#76726B`.
- **Ghost/Tertiary Button**: No border or background; uses `#24211E` or `#5A6B54` with an underline transition on hover.

### Chips & Filters
- **Default State**: Surface `#FFFFFF`, border 1px solid `#ECE7DF`, typography `label-sm`, text color `#76726B`. Padding `6px 14px`.
- **Active State**: Surface `#24211E`, text `#F9F8F5`, border 1px solid `#24211E`.
- **Dietary & Provenance Tags**: Soft sage `#5A6B54` at 10% background tint with `#5A6B54` text and no border.

### Input Fields & Search
- Container background `#FFFFFF` with 1px solid `#ECE7DF`.
- Focus state switches border to 1px solid `#24211E` (no glowing outline rings).
- Placeholder text in `#76726B` (40% opacity). Typography uses `body-md` in `Plus Jakarta Sans`.

### Cards (Dining & Recommendation)
- Built on `#FFFFFF` base with 1px solid `#ECE7DF` perimeter border. Padding: `space-lg`.
- Image ratios adhere to 16:10 or 4:3 formats with 0px corner radius internally to emulate editorial photography.
- Editorial headline rendered in `Newsreader` (`headline-sm`), accompanied by location and cuisine meta in `body-sm` (`#76726B`).
- AI Recommendation callouts sit in a dedicated block within the card: a 1px left accent border in `#5A6B54`, set on a transparent background with italicized `body-md` copy.

### Checkboxes & Radio Controls
- Unchecked: 16px square/circle with 1px solid `#ECE7DF`, `#FFFFFF` interior.
- Checked: Solid `#24211E` fill with an off-white `#F9F8F5` interior mark. Never uses vibrant blue or neon green.

### Sensory & Vibe Indicators (Custom)
- Compact typographic horizontal meters indicating ambience (e.g., "Acoustics: Intimate", "Pacing: Leisurely") rendered in `label-sm` with subtle 2px bar indicators in `#EAE6DF` filled with `#5A6B54`.