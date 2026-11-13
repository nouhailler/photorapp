# Project Context: Gallery Pro (v2.5.0)

Ce document récapitule l'état architectural, les services opérationnels, les conventions de données et les flux d'exécution de l'application **Gallery Pro**.

---

## 🏗️ Architecture Globale & Philosophie

Gallery Pro est une application **Local-First** conçue avec React 19, TypeScript et Vite.
Toutes les données photographiques, albums, tags, coordonnées GPS, miniatures et ajustements sont stockés localement sur le poste ou l'appareil de l'utilisateur via **IndexedDB** (`GalleryProDB`).

### 1. Persistance & Données (`src/utils/db.ts`)
- **Base IndexedDB :** Nommée `GalleryProDB` (v3).
- **Stores principaux :**
  - `photos` : Métadonnées complètes, scoring, sceneTags, autoKeywords, ajustements, chemins d'accès ou clés de blobs.
  - `blobs` : Blobs binaires des fichiers photo originaux importés.
  - `thumbnails` : Miniatures optimisées (~20 Ko en WebP/JPEG) réduisant de 99 % l'empreinte RAM de la galerie.
  - `albums` : Définitions des collections (manuelles ou dynamiques avec règles).
  - `persons` : Groupes de visages anonymes/nommés manuellement (effaçables de manière irréversible).
  - `metadata` : Préférences globales, historique de migration et statut d'intégrité.
- **Migration LocalStorage sécurisée :** Fonction `migrateFromLocalStorage()` idempotente, vérifiant les identifiants déjà présents, ne supprimant jamais les données d'origine avant validation et générant un rapport de migration exhaustif.
- **Diagnostic & Nettoyage :** Fonction `diagnoseStorage()` estimant la taille occupée, le nombre de miniatures manquantes et identifiant les blobs/miniatures orphelins (`cleanupOrphanedBlobs()`, `cleanupOrphanedThumbnails()`).

---

## 📦 Services Métier Opérationnels

- **`src/services/thumbnailService.ts` :**
  - Génération haute performance via `createImageBitmap` / `OffscreenCanvas` avec repli Canvas/JPEG et régénération en lot `regenerateAllMissingThumbnails()`.
- **`src/services/aiVisionService.ts` :**
  - Classification locale des scènes par vision par ordinateur (histogrammes HSV, segmentation ciel/sol, analyse directionnelle Sobel, détection de tons chair) et enrichissement par mots-clés automatiques.
- **`src/services/naturalSearchService.ts` & `src/services/searchEngine.ts` :**
  - Analyseur de requêtes en langage naturel (saisons, scènes, favoris, GPS, flou, années) couplé au moteur multicritère (`smartSearchPhotos`).
- **`src/services/souvenirService.ts` :**
  - Générateur rétrospectif strictement basé sur les dates EXIF et lieux réels (« Ce jour-là il y a 1 an », « Même saison », « Escapades », « Coups de cœur oubliés »).
- **`src/services/faceService.ts` :**
  - Regroupement local opt-in des portraits (`Personne 1`, etc.), renommage manuel et purge biométrique irréversible (`clearAllFaceData()`).
- **`src/services/activityService.ts` :**
  - File de tâches unifiée avec progression temps réel et annulation via `AbortController`.
- **`src/services/benchmarkService.ts` :**
  - Suite de tests de montée en charge mesurant génération, indexation, recherche texte, filtrage croisé, groupage et mémoire de 1 000 à 20 000 photos.
- **`src/services/importService.ts` :**
  - Traitement par lot avec extraction des métadonnées EXIF/GPS, génération immédiate des miniatures et détection de doublons.
- **`src/services/exportService.ts` :**
  - Sauvegarde intégrale `createFullLibraryBackup()`, pré-validation sans écriture `simulateRestoreBackup()`, et restauration certifiée SHA-256 `restoreFullLibraryBackup()`.
- **`src/services/duplicateService.ts` :**
  - Détection de doublons stricts (SHA-256) et de quasi-doublons / prises de vue en rafale (dHash perceptuel).
- **`src/services/qualityService.ts` :**
  - Scoring automatique de netteté (variance du Laplacien), résolution, exposition et calcul d'empreinte perceptuelle 64-bit `dHash`.
- **`src/services/smartAlbumService.ts` :**
  - Évaluation de critères dynamiques pour l'auto-remplissage des albums.
- **`src/services/updateService.ts` :**
  - Gestion de version (`v2.5.0`), vérification manuelle, mise à jour forcée et routine périodique en arrière-plan.


---

## 🎨 Interface Utilisateur, Menu Hamburger & Onboarding

- **`src/components/HamburgerMenu.tsx` :**
  Tiroir latéral classé en 4 catégories :
  1. *Photothèque & Souvenirs* (Galerie, Albums, Recherche Avancée)
  2. *Outils Intelligents & Qualité* (Intelligence IA, Doublons & Similitudes, Carte GPS)
  3. *Gestion des Données* (Sauvegardes & Restauration, Importer des photos, Santé du stockage)
  4. *Système & Préférences* (Paramètres Système, Guide Novice, Mentions Légales)
- **`src/context/HelpContext.tsx` & `src/components/HelpTooltip.tsx` :**
  - Contexte global gérant le mode novice `isHelpModeActive` (activé par défaut) et le statut d'acceptation des mentions légales.
  - Infobulles contextuelles animées (badges `?` interactifs) sur les champs, sliders de retouche et boutons clés.
- **`src/components/OnboardingModal.tsx` :**
  - Modale d'accueil guidant le premier usage et soumettant la clause contractuelle de décharge de responsabilité légale relative aux données utilisateur.
- **`src/pages/SystemSettings.tsx` (`/settings`) :**
  - Écran complet des paramètres système : version, date de sortie, horodatage de dernière vérification, bouton « Vérifier les mises à jour », bouton « Forcer la mise à jour », et interrupteur du vérificateur en arrière-plan.
- **`src/hooks/usePWAInstall.ts` & `src/components/PWAInstallButton.tsx` :**
  - Gestion native de l'événement `beforeinstallprompt`, détection du mode autonome (standalone) et guide pas-à-pas pour les utilisateurs iOS Safari.

---

## ⚖️ Mentions Légales & Responsabilité des Données

L'application stipule formellement que :
1. Les données photographiques et métadonnées sont traitées et conservées exclusivement sur l'équipement terminal de l'utilisateur.
2. L'auteur et l'éditeur de l'application déclinent toute responsabilité en cas de perte de données, de défaillance matérielle ou logicielle du navigateur, ou d'incompatibilité de fichiers.
3. L'acceptation de ces conditions est recueillie lors du premier lancement et consignée de manière permanente.
