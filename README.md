# Gallery Pro

Gallery Pro is a high-performance, mobile-optimized photo management web application. Built with a focus on "Invisible Utility," it provides a sophisticated environment for organizing, viewing, and editing your visual assets.

## 🚀 Features

- **Immersive Gallery:** Chronological photo wall with smooth interactions and progressive loading.
- **Non-Destructive Editor:** Adjust brightness, contrast, and saturation. All changes are saved as metadata without altering the original image.
- **AI Intelligence:**
  - Facial recognition UI.
  - Smart cleaning tools (blurry photos, duplicates).
  - Interactive map with EXIF-based geolocation.
- **Collections:** Create and manage personal or shared albums with unique "stack" visuals.
- **Content Transfer:** Comprehensive import/export flows for local files, Google Photos, and ZIP archives.
- **Responsive Design:** Optimized for Android, iOS, and desktop web browsers.

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (following the Gallery Pro Design System)
- **Icons:** Material Symbols Outlined
- **Persistence:** LocalStorage (Mock Backend)
- **Deployment:** Netlify

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nouhailler/photorapp.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` folder.

## 🌐 Deployment

This project is optimized for **Netlify**. It includes a `netlify.toml` file to handle React Router redirects.

Simply link your GitHub repository to Netlify and it will automatically build and deploy the application.

## 🎨 Design System

The app follows the **Gallery Pro** design system:
- **Primary Color:** Electric Indigo (`#1E35D0`)
- **Typography:** Inter
- **Aesthetic:** Modern Minimalism meets Glassmorphism.

---
Built with ❤️ for photographers and visual storytellers.
