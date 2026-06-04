---
name: Vibrant Cinema Experience
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#594049'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8d6f79'
  outline-variant: '#e0bdc8'
  surface-tint: '#b7006e'
  primary: '#b3006c'
  on-primary: '#ffffff'
  primary-container: '#dc1787'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb0cd'
  secondary: '#6d5964'
  on-secondary: '#ffffff'
  secondary-container: '#f7dbe9'
  on-secondary-container: '#735e6a'
  tertiary: '#006b1f'
  on-tertiary: '#ffffff'
  tertiary-container: '#008729'
  on-tertiary-container: '#f7fff1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e5'
  primary-fixed-dim: '#ffb0cd'
  on-primary-fixed: '#3e0022'
  on-primary-fixed-variant: '#8c0053'
  secondary-fixed: '#f7dbe9'
  secondary-fixed-dim: '#dabfcd'
  on-secondary-fixed: '#261720'
  on-secondary-fixed-variant: '#54414c'
  tertiary-fixed: '#6fff7b'
  tertiary-fixed-dim: '#4be260'
  on-tertiary-fixed: '#002205'
  on-tertiary-fixed-variant: '#005316'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  lavender-seat: '#EEDBFF'
  purple-text: '#7A3BB3'
  couple-pink: '#FDE6F2'
  booked-dark: '#1F2937'
  warning-orange: '#F59E0B'
  text-dark: '#2B2B2B'
  text-muted: '#777777'
typography:
  header-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  movie-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  seat-id:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
  screen-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.2em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-margin: 1rem
  gutter-xs: 0.25rem
  gutter-sm: 0.5rem
  section-gap: 1.5rem
  sticky-footer-height: 160px
---

## Brand & Style

The design system is built to evoke excitement, energy, and a premium "night out" atmosphere. It balances a playful, feminine-leaning color palette with a structured, professional layout to ensure trust during the transaction process.

The aesthetic follows a **Corporate Modern** style with **Minimalist** influences. It prioritizes clarity and mobile-first ergonomics, utilizing high-contrast primary actions and soft, layered backgrounds to create depth without clutter. The interface should feel "app-native" on both iOS and Android, respecting safe areas and utilizing standard touch gestures for seat selection.

## Colors

The palette is anchored by a high-energy **Hot Pink** for primary interactions and brand identification. **Soft Pink** and **Lavender** are used as functional neutrals to differentiate seat types without overwhelming the user.

- **Primary (Hot Pink):** Reserved for the "Continue" action, selected states, and the screen indicator.
- **Secondary (Soft Pink):** Used for header backgrounds and couple seats.
- **Tertiary (VIP Green):** Specifically for VIP boundary markers.
- **Neutrals:** A light gray scale is used for text, borders, and disabled states to ensure maximum legibility against the vibrant brand colors.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, modern, and highly legible characteristics. 

- **Headlines:** Use Bold weights for cinema names and movie titles to establish immediate hierarchy.
- **Interactive Labels:** Seat IDs and legend text use medium weights to maintain clarity at small scales.
- **The Screen Label:** Centered under the arc, this uses increased letter spacing and uppercase styling to function as a spatial landmark rather than standard prose.
- **Price Display:** Emphasized with a larger font size and bold weight to ensure users are aware of the total before proceeding.

## Layout & Spacing

The layout is a **Fixed-Width Seat Map** contained within a **Fluid Mobile Container**.

- **Vertical Rhythm:** The screen is divided into three distinct zones: a fixed Header, a scrollable Seat Map area (occupying the majority of the viewport), and a sticky Bottom Summary Panel.
- **Seat Grid:** Seats are arranged in a strict grid with 4px (gutter-xs) spacing. Large rooms must allow for horizontal scrolling while the rest of the UI remains static.
- **Safe Areas:** Padding must be dynamically calculated for the notch/status bar in the header and the home indicator in the sticky footer.

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layering** and **Subtle Shadows**:

- **Header:** Flat, uses a soft gradient from the top to ground the navigation.
- **Seat Map:** Flat, but the "Selected" state uses a subtle ambient shadow to make the pink pop from the lavender background.
- **Minimap:** A high-contrast dark container floated over the seat map to provide a "picture-in-picture" sense of depth.
- **Bottom Panel:** Uses a soft, diffused top-edge shadow (8px blur, 5% opacity black) to indicate its sticky behavior and separation from the scrolling content.

## Shapes

The shape language is **Soft**, avoiding both clinical sharp corners and overly playful pill shapes for the primary UI containers.

- **Seats:** Rounded rectangles with a 4px (0.25rem) radius.
- **Action Buttons:** Large primary buttons use a 12px (rounded-lg) radius to feel accessible and easy to tap.
- **Header Components:** Circular back buttons and pill-shaped action groups provide a friendly contrast to the grid-heavy seat map.
- **VIP Indicator:** A 2px stroke outline that follows the collective boundary of the VIP seat group.

## Components

### Seats
- **Normal:** Lavender background, purple text.
- **Selected:** Hot Pink background, white text.
- **Booked:** Dark Charcoal background. For seats with movie artwork, use a clipped image mask.
- **VIP:** Lavender or Pink background (depending on selection) with a persistent Green outline.
- **Double/Couple:** Double width relative to normal seats, soft pink background.

### Screen Indicator
A 4px thick Hot Pink arc with rounded terminals. Centered text "MÀN HÌNH" sits 8px below the arc.

### Sticky Bottom Bar
A white container with a top shadow. It must include:
- A horizontal split for movie info (Left: Title/Rating, Right: Change Showtime).
- A horizontal split for pricing (Left: Label, Right: Bold Amount).
- A full-width "Tiếp tục" button that is disabled (opacity 0.5) until a seat is selected.

### Seat Legend
A horizontal row of markers. Each marker is a 16x16px representation of the seat type followed by a label. If space is limited, this row should allow horizontal overflow scrolling.