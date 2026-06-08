# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-06-08

### Added
- **Project Foundation:** Initialized Vite + React + TypeScript project.
- **Design System:** Implemented "Gallery Pro" design tokens in Tailwind CSS.
- **Core Layout:** Created frosted-glass `TopAppBar` and `BottomNavBar`.
- **Photo Library:**
  - Implemented `PhotoContext` for global state management.
  - Added support for chronological photo grouping in the Gallery view.
  - Implemented `DetailView` for full-screen photo inspection.
- **Editing Tools:**
  - Created a non-destructive image editor for brightness, contrast, and saturation.
  - Persisted adjustment metadata in `LocalStorage`.
- **AI Intelligence:**
  - Added UI for facial recognition, smart cleaning, and interactive map widgets.
- **Collections:** Implemented Album view with unique stack visual effects.
- **Content Transfer:** Added UI for Import/Export flows and cloud integration.
- **Assets:** Created custom SVG application icon.
- **Documentation:** Added `README.md`, `CONTEXT.md`, and `CHANGELOG.md`.
- **Deployment:** Configured `netlify.toml` for seamless hosting.

### Fixed
- Resolved TypeScript import resolution issues during build.
- Optimized image loading with lazy-loading attributes.
