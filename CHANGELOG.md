# Changelog

Toutes les modifications notables apportées à **Gallery Pro (Photorapp)** sont consignées dans ce fichier.

Le format suit les conventions de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) (catégories standards `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`) et le projet utilise le versionnement sémantique [Semantic Versioning](https://semver.org/).

> **Note de cohérence des versions :** La version applicative déclarée dans `src/services/updateService.ts` est `2.5.0` (date de sortie : `13 Novembre 2026`). Le fichier `package.json` indique encore `"version": "0.0.0"` et aucun historique ou tag Git n'étant accessible dans cet environnement d'audit, les dates et périmètres antérieurs s'appuient sur le CHANGELOG historique et l'inspection directe du code source.

---

## [Unreleased] - 2026-11-16

### Added
- **Préparation au déploiement Cloudflare (`wrangler.jsonc`, `public/_headers`, `.node-version`, `package.json`) :** Ajout de la configuration Cloudflare Workers Static Assets (`not_found_handling: "single-page-application"`), des en-têtes `_headers` (sécurité + cache `must-revalidate` pour `index.html`/`sw.js`/`manifest.webmanifest` et `immutable` pour `/assets/*`), de l'épinglage Node `22` (`.node-version` + `engines.node`) et des scripts `cf:deploy`, `cf:preview`, `cf:pages`.
- **Internationalisation complète FR/EN de l'application (`src/context/LanguageContext.tsx`, `languageContextDef.ts`, `useLanguage.ts`):**
  - Contexte linguistique global partagé entre la vitrine publique (`/`, `/en`) et l'ensemble de l'application (`/gallery`, `/app`, `/albums`, `/albums/:id`, `/ia`, `/search`, `/sharing`, `/settings`), persisté via `localStorage` (`gallery_pro_lang`, `'fr'` par défaut).
  - Passage automatique en anglais lors de l'entrée depuis `/en` ou `?lang=en`, synchronisation de `document.documentElement.lang` et bascule `FR / EN` accessible depuis la barre supérieure (`Layout.tsx`), le tiroir latéral (`HamburgerMenu.tsx`) et la carte dédiée dans `/settings` (`SystemSettings.tsx`).
  - Traduction complète des pages (`Gallery`, `Albums`, `AlbumDetail`, `IntelligenceIA`, `Search`, `Sharing`, `SystemSettings`), des modales/composants (`DetailView`, `Editor`, `PhotoGrid`, `SlideshowModal`, `SouvenirsCarousel`, `MapComponent`, `OnboardingModal`, `ImportModal`, `RestoreSimulationModal`, `ActivityCenterModal`, `PWAInstallButton`, `HelpTooltip`) et des sorties de services (`souvenirService`, `naturalSearchService`, `searchEngine`, `updateService`, `faceService`, `importService`, `exportService`, `activityService`).
- **Landing page produit publique bilingue FR/EN sur `/` et `/en` (`src/pages/LandingPage.tsx`, `src/components/landing/`):** Vitrine éditoriale dédiée à **Gallery Pro — Your Visual Legacy**, dotée d'une navigation ancres + mobile et d'un sélecteur `FR / EN` (`LandingHeader.tsx`, `LandingLangContext.tsx`), d'un lien croisé en pied de page (`LandingFooter.tsx`), de métadonnées SEO/OpenGraph/Twitter/JSON-LD (`index.html`) et de 18 modules dédiés traduits intégralement en français (`/`) et en anglais (`/en` ou `?lang=en`) sans affichage de la modale légale `OnboardingModal` sur la page publique.
- **Hero orienté produit (`HeroSection.tsx`) :** Mise en scène de l'interface réelle (`/screenshots/gallery-grid.png` et aperçu de `/screenshots/photo-editor.png`) accompagnée du double CTA (`/gallery` et `#demo`).
- **Démonstrations interactives isolées (`InteractiveDemoSection.tsx`) :**
  - `DemoGallery.tsx` : mini-galerie en lecture seule reposant sur 8 clichés locaux embarqués (`src/assets/images/` via `landingMedia.ts`), avec filtres par catégorie/favoris et visionneuse agrandie navigable au clavier (`Échap`, flèches) sans écriture dans IndexedDB.
  - `DemoSearch.tsx` : champ de saisie libre et exemples cliquables appelant directement le parseur réel `parseNaturalLanguageQuery()` (`naturalSearchService.ts`), avec synthèse pédagogique (FR/EN) et rappel transparent des limites lexicales.
  - `DemoPhotoEditor.tsx` : comparateur Avant/Après interactif (glisser tactile/souris + curseur `<input type="range">`) avec préréglages `Original`, `Vivid`, `Noir et blanc`/`Black & White`, `Cinéma`/`Cinema` et note sur la différence entre aperçu CSS et export Canvas (`exportService.ts`).
- **Parcours utilisateur visuel en 4 étapes (`UserJourneySection.tsx`) :** Présentation illustrée des étapes *Importer*, *Organiser*, *Retrouver et retoucher* et *Préserver* via des captures réelles de l'application.
- **Jeu de 7 captures réelles de l'application (`public/screenshots/`) :** `gallery-grid.png`, `gallery-drawer.png`, `import-modal.png`, `albums-view.png`, `photo-editor.png`, `ia-analysis-map.png` et `sharing-restore-sim.png`.
- **Tests et outillage de vérification :** Ajout de `src/pages/LandingPage.test.tsx` (`9` tests), `src/context/LanguageContext.test.tsx` (`4` tests) et cas anglais dans `Editor.test.tsx`, `souvenirService.test.ts` et `naturalSearchService.test.ts` (portant la suite Vitest à `14` fichiers / `72` tests), plus `playwright` (`1.65.1`) en `devDependencies` pour les vérifications multi-écrans (`375px`–`1920px`).

### Changed
- **Séparation des routes vitrine et application (`src/App.tsx`, `HamburgerMenu.tsx`) :** La vitrine publique occupe `/` (FR) et `/en` (EN) hors `<Layout>`, tandis que l'espace galerie complet devient accessible sur `/gallery` (avec alias `/app`), tout en préservant l'ensemble des routes internes (`/albums`, `/albums/:id`, `/ia`, `/search`, `/sharing`, `/settings`) et des données `GalleryProDB v3`.
- **Mise à jour documentaire (`README.md`, `CONTEXT.md`, `CHANGELOG.md`) :** Synchronisation de l'architecture bilingue FR/EN, des routes, des captures, de la liste des polices chargées et de la couverture de tests.

---

## [2.5.0] - 2026-11-13

### Added
- **Analyse locale des scènes par heuristiques (`src/services/aiVisionService.ts`) :** Extraction des 5 couleurs dominantes, calcul d'histogrammes HSV, segmentation spatiale ciel/sol, estimation directionnelle des contours (type Sobel) et génération d'étiquettes (`Nature & Paysage`, `Plage & Mer`, `Coucher de soleil`, `Architecture & Ville`, `Nuit & Basse lumière`, `Portrait & Personnes`, `Animaux & Faune`) ainsi que de mots-clés automatiques (`autoKeywords`). *(Méthode algorithmique déterministe sans modèle de réseau neuronal).*
- **Analyseur de recherche en langage naturel (`src/services/naturalSearchService.ts`) :** Interprétation lexicale locale en français et en anglais des intentions (`favori`, `flou`, `gps`), des années (`1990`–`2040`), des saisons (`hiver`, `printemps`, `été`, `automne` mappées sur leur mois central) et de 17 groupes de synonymes sémantiques, avec badges d'interprétation dans `/search`.
- **Carrousel de Souvenirs rétrospectifs (`src/services/souvenirService.ts`, `src/components/SouvenirsCarousel.tsx`) :** Génération de souvenirs fondés exclusivement sur les dates et lieux réels du catalogue (`Ce jour-là il y a 1 an`, `2/3/5/7/10 ans`, `À cette période de l'année`, `Escapades` par lieu et `Coups de cœur oubliés`).
- **Regroupement expérimental des personnes opt-in (`src/services/faceService.ts`) :** Activation manuelle explicite, regroupement séquentiel par lots de 4 clichés classés portrait (`Personne 1`, `Personne 2`...), renommage manuel et suppression individuelle sans altérer les photos originales. *(Ne réalise ni détection de boîtes faciales ni reconnaissance biométrique).*
- **Store dédié aux miniatures dans IndexedDB v3 (`src/utils/db.ts`, `src/services/thumbnailService.ts`) :** Ajout des object stores `thumbnails` et `persons` (ainsi que `settings`), avec pipeline de génération de miniatures `360px` max en WebP (repli JPEG) via `createImageBitmap` / `OffscreenCanvas` / Canvas.
- **Virtualisation par fenêtrage de lignes (`src/components/PhotoGrid.tsx`) :** Rendu virtualisé avec marge (`OVERSCAN = 3`) activé automatiquement au-delà de `48` photos (hors grille vitrine `featured`).
- **Suite de benchmark synthétique (`src/services/benchmarkService.ts`) :** Exécution depuis `/settings` de mesures chronométrées (`1 000`, `5 000`, `10 000` et `20 000` fiches `remote` en mémoire) couvrant génération, indexation `Map`, recherche plein texte, filtrage multicritère, groupement chronologique, tri et estimation RAM JS. *(Ne mesure pas les entrées/sorties IndexedDB réelles ni le framerate DOM).*
- **Simulation de restauration et réparation du stockage (`src/services/exportService.ts`, `src/components/RestoreSimulationModal.tsx`) :** Pré-validation non destructive des archives `.gpro.zip` (`simulateRestoreBackup`) avant écriture, régénération en lot des miniatures manquantes (`regenerateAllMissingThumbnails`) et purge des blobs/miniatures orphelins (`cleanupOrphanedBlobs`, `cleanupOrphanedThumbnails`).
- **Centre d'activité unifié (`src/services/activityService.ts`, `src/components/ActivityCenterModal.tsx`) :** File de tâches (20 entrées max) avec suivi d'avancement en direct et annulation via `AbortController`. *(Raccordé à l'analyse IA par lot `analyzeAllPhotos` ; les autres opérations longues restent à connecter).*
- **Couverture de tests unitaires étendue :** Ajout des suites `aiVisionService.test.ts`, `benchmarkService.test.ts`, `naturalSearchService.test.ts`, `souvenirService.test.ts` et `SlideshowModal.test.tsx`.

### Changed
- **Mise à jour de la version système (`src/services/updateService.ts`) :** Passage de `APP_VERSION` à `2.5.0` et `APP_RELEASE_DATE` à `13 Novembre 2026`.
- **Optimisation mémoire de la photothèque (`src/context/PhotoContext.tsx`, `src/hooks/usePhotoUrl.ts`) :** Chargement prioritaire des miniatures dans la grille (`usePhotoUrl(photo, true)`) avec cache séparé des `ObjectURL` (`${id}_thumb` vs `id`).
- **Enrichissement des diagnostics IndexedDB (`diagnoseStorage`) :** Suivi du nombre de miniatures présentes (`thumbnailsCount`) et manquantes (`missingThumbnailsCount`).

### Fixed
- **Cohérence du carrousel et des filtres :** Prévention de toute invention de lieu ou de date dans les souvenirs (exclusion explicite de `Lieu inconnu`) et prise en compte de `minQuality` et `semanticTags` dans `searchEngine.ts`.

### Security
- **Suppression irréversible des données de personnes (`clearAllFaceData`) :** Purge complète du store IndexedDB `persons` et réinitialisation du consentement opt-in `gallery_pro_faces_enabled` en un clic depuis `/ia`.

---

## [2.4.0] - 2026-11-10

### Added
- **Menu Hamburger catégorisé (`src/components/HamburgerMenu.tsx`) :** Tiroir latéral structuré en 4 familles (*Photothèque & Souvenirs*, *Outils Intelligents & Qualité*, *Gestion des Données*, *Système & Préférences*).
- **Paramètres système et gestion des mises à jour (`src/pages/SystemSettings.tsx`, `src/services/updateService.ts`) :** Affichage de la version, de la date de sortie et de l'horodatage de dernière vérification ; ajout des actions *« Vérifier les mises à jour »*, *« Forcer la mise à jour »* (purge de `CacheStorage` sans affecter IndexedDB) et d'un vérificateur périodique en arrière-plan (intervalle par défaut de 15 minutes).
- **Onboarding avec mentions légales (`src/components/OnboardingModal.tsx`) :** Parcours de bienvenue en 3 étapes intégrant une case à cocher obligatoire confirmant que l'utilisateur reste seul responsable des données stockées localement et de leurs sauvegardes.
- **Mode accompagnement novice (`src/context/HelpContext.tsx`, `src/components/HelpTooltip.tsx`) :** Infobulles interactives `?` sur les curseurs de retouche, champs de recherche et actions de gestion de données, avec interrupteur d'activation global.
- **Bouton d'installation PWA (`src/hooks/usePWAInstall.ts`, `src/components/PWAInstallButton.tsx`) :** Prise en charge de l'événement `beforeinstallprompt` sur navigateurs compatibles et affichage d'un guide illustré pour iOS Safari.
- **Identité visuelle :** Ajout des ressources vectorielles `/public/logo.svg` et `/public/app_preview.svg`.

---

## [2.3.0] - 2026-11-09

### Added
- **Migration sécurisée LocalStorage → IndexedDB (`migrateFromLocalStorage`) :** Migration indépendante et idempotente des photos et albums détectant les identifiants existants sans écraser les données déjà stockées et produisant un `MigrationReport` enregistré dans `settings` (`migration_v2_report`).
- **Suppression atomique et synchronisation des albums (`deletePhotoAtomic`, `deletePhotosAtomic`) :** Mise à jour des `albumIds`, recalcul des `photoCount` et réassignation ou nettoyage des `coverPhotoId` lors de la suppression de photos.
- **Sauvegarde intégrale et contrôle d'intégrité (`createFullLibraryBackup`, `restoreFullLibraryBackup`) :** Exportation `.gpro.zip` avec `backup_manifest.json` (`manifest_version: 2`) et contrôle des empreintes SHA-256 à la restauration.
- **Moteur de recherche avancé (`src/services/searchEngine.ts`) :** Filtrage multicritère par requête texte, année, mois, lieu, appareil, favoris, coordonnées GPS et état de flou.
- **Détection de doublons et qualité (`src/services/duplicateService.ts`, `src/services/qualityService.ts`) :** Identification des doublons stricts par SHA-256, calcul d'empreinte perceptuelle 64 bits `dHash` pour les quasi-doublons et évaluation de la netteté par variance du Laplacien et luminance moyenne.
- **Albums intelligents (`src/services/smartAlbumService.ts`) :** Évaluation dynamique des critères `SmartAlbumCriteria`.

### Changed
- **Séparation du stockage binaire et des métadonnées :** Bascule complète de l'importation (`importService.ts`) et de la lecture (`PhotoContext.tsx`) vers IndexedDB pour les fichiers locaux, tout en conservant un miroir léger de métadonnées en `localStorage`.

---

## [0.1.0] - 2026-06-08

### Added
- Initialisation du projet Vite + React + TypeScript (`photorapp`).
- Modèle de données initial (`src/types/types.ts`), jeu de démonstration (`src/assets/data/mockData.ts`) et premiers écrans de galerie, d'albums, d'édition et de carte Leaflet.
