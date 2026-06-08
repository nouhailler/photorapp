# Project Context: Gallery Pro

This document provides essential information for continuing development on the Gallery Pro application.

## 🏗 Current Architecture

- **State Management:** Centralized `PhotoContext` in `src/context/PhotoContext.tsx`. It handles the photo library state, favorites, and adjustment metadata.
- **Persistence:** All data is currently persisted in `LocalStorage` under the key `gallery_pro_photos`. This mimics a backend for a static deployment.
- **Data Model:** Defined in `src/types/types.ts`. Photos have nested metadata (EXIF) and adjustment objects.
- **Routing:** Handled by `React Router` in `src/App.tsx`. All main views (Gallery, Albums, IA, Search, Sharing) are modularized in `src/pages`.

## 🎨 Design System Implementation

- **Tailwind Config:** The `tailwind.config.js` file contains the custom color palette (Indigo-based) and spacing tokens from the "Gallery Pro" design spec.
- **Glassmorphism:** Standardized via the `.glass` utility class in `src/index.css`.
- **Icons:** Uses Google's `Material Symbols Outlined`. Note the use of `.material-symbols-fill` for active states.

## 📍 Where we are (v0.1.0)

1.  **UI/UX:** All major screens from the design phase have been converted to functional React components.
2.  **Functionality:**
    *   Chronological photo grouping is implemented.
    *   Detail view and non-destructive editor are functional.
    *   Favorites toggle works and persists.
    *   AI Intelligence pages are implemented as high-fidelity UI mocks ready for integration.
3.  **Backend:** Currently "Mocked". Integration with a real backend (e.g., Supabase or Cloudinary) would be the next major step.

## 🚀 Next Steps

- **Backend Integration:** Replace LocalStorage with a persistent database.
- **Image Uploads:** Implement real file uploads in `src/pages/Sharing.tsx`.
- **AI Logic:** Integrate real AI services for face detection and object recognition.
- **Performance:** Add image virtualization (e.g., `react-window`) for extremely large libraries.
- **PWA:** Add a service worker for offline viewing and "Add to Home Screen" support.

## 🛠 Useful Commands

- `npm run dev`: Start development server.
- `npm run build`: Production build (verifies types and vite build).
- `npm run lint`: ESLint check.
