---
name: Gallery Pro
colors:
  surface: '#f9f9fd'
  surface-dim: '#d9dade'
  surface-bright: '#f9f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f7'
  surface-container: '#eeedf2'
  surface-container-high: '#e8e8ec'
  surface-container-highest: '#e2e2e6'
  on-surface: '#1a1c1f'
  on-surface-variant: '#444655'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f0f0f4'
  outline: '#757687'
  outline-variant: '#c5c5d8'
  surface-tint: '#364be1'
  primary: '#1e35d0'
  on-primary: '#ffffff'
  primary-container: '#3e52e8'
  on-primary-container: '#dfe0ff'
  inverse-primary: '#bcc2ff'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#00583b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00734e'
  on-tertiary-container: '#6efbbd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bcc2ff'
  on-primary-fixed: '#000b62'
  on-primary-fixed-variant: '#132cca'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c6c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9fd'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  grid-gap: 2px
  container-padding: 16px
  element-gap: 12px
  section-margin: 24px
---

## Brand & Style
The design system is centered on "Invisible Utility"—a philosophy where the interface recedes to ensure the photography remains the protagonist. The brand personality is professional, precise, and sophisticated, targeting power users and hobbyists who require an organized, high-performance environment for their visual assets.

The aesthetic blends **Modern Minimalism** with **Glassmorphism**. High-density information is managed through generous white space and strict alignment, while depth and "intelligence" are signaled through frosted glass overlays that allow the colors of the photos to bleed through the UI, creating a context-aware experience.

## Colors
The palette is dominated by a deep "Electric Indigo" primary color, used for high-intent actions and active states. 

- **Primary (#3E52E8):** Focus, selection, and primary buttons.
- **Surface & Background:** The default state uses a pristine white (#FFFFFF) for maximum photo contrast, paired with a soft grey (#F4F5F7) for secondary containers and subtle borders.
- **Accents:** Vibrant emerald (#10B981) for success and AI-processed status, and a warm rose (#F43F5E) for "Favorites" and highlights.
- **Dark Accents:** Used for navigation bars and text to provide a grounded, professional feel.

## Typography
The design system utilizes **Inter** exclusively to achieve a systematic, utilitarian aesthetic that feels contemporary and highly readable. 

Headlines utilize a tight letter-spacing and bold weights to provide clear structural hierarchy during rapid scrolling. Body text is optimized for legibility in metadata views, while uppercase labels are reserved for categories and technical specs (ISO, Aperture) to differentiate them from user-generated content.

## Layout & Spacing
This design system employs a **Fluid Grid** model specifically optimized for media aspect ratios. 

- **Photo Grids:** Use a minimal 2px gutter to create an "immersive wall" effect, allowing photos to feel interconnected.
- **Margins:** Standard 16px lateral padding for all UI controls and textual content to ensure thumb-reachability on mobile.
- **Breakpoints:** On tablets, the grid expands from a 3-column layout to a 6-column or 8-column layout, maintaining the same 2px gutter to emphasize scale.

## Elevation & Depth
Depth is communicated through **Glassmorphism** and **Ambient Shadows** rather than traditional solid layers.

- **Toolbars & Navigation:** Use a 20px Backdrop Blur with a 70% opacity white fill. This allows colors from the photo library to scroll underneath, maintaining a sense of place.
- **Floating Action Buttons:** Feature a high-diffusion shadow (Blur: 12px, Y: 4px) tinted with the primary indigo color to simulate a light source and suggest interactivity.
- **Modals:** Utilize a soft dimming overlay (30% black) to pull focus to the foreground without completely disconnecting from the gallery.

## Shapes
The design system uses a **Rounded** corner strategy (0.5rem base) to soften the professional tone and make the app feel more accessible. 

- **Photos/Thumbnails:** Use a subtle 4px radius in grid views, but 12px (rounded-lg) when displayed as Album Cards.
- **Buttons & Inputs:** Consistent 8px radius to balance the geometric nature of the photo grid.
- **Search Bars:** Utilize a fully rounded "pill" shape (rounded-xl) to distinguish search as a primary, AI-driven entry point.

## Components
- **Immersive Grid:** Items should utilize `object-fit: cover`. Selection mode is triggered by long-press, adding a primary color border and a checkmark icon to the top-right of the thumbnail.
- **Floating Action Button (FAB):** A circular indigo button containing a simple "Plus" or "Camera" icon, positioned at the bottom-right with a 16px offset.
- **Album Cards:** A stacked-layered effect where the main thumbnail is supported by two smaller preview images behind it, suggesting a collection.
- **Bottom Navigation:** Uses a frosted glass background. Active states are indicated by the primary indigo color; inactive states are neutral grey. Icons should be stroke-based (2px) for a clean look.
- **AI Search Bar:** Features a subtle gradient border or a "sparkle" icon to hint at natural language processing capabilities.
- **Chips:** Small, pill-shaped tags used for "People," "Places," and "Categories" with a light grey background and dark text.