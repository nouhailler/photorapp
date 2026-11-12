# Project Context: Gallery Pro (v2.4.0)

Ce document récapitule l'état architectural, les services opérationnels, les conventions de données et les flux d'exécution de l'application **Gallery Pro**.

---

## 🏗️ Architecture Globale & Philosophie

Gallery Pro est une application **Local-First** conçue avec React 19, TypeScript et Vite.
Toutes les données photographiques, albums, tags, coordonnées GPS et ajustements sont stockés localement sur le poste ou l'appareil de l'utilisateur via **IndexedDB** (`GalleryProDB`).

### 1. Persistance & Données (`src/utils/db.ts`)
- **Base IndexedDB :** Nommée `GalleryProDB` (v2).
- **Stores principaux :**
  - `photos` : Métadonnées complètes, scoring, tags, ajustements, chemins d'accès ou clés de blobs.
  - `blobs` : Blobs binaires des fichiers photo originaux importés.
  - `albums` : Définitions des collections (manuelles ou dynamiques avec règles).
  - `metadata` : Préférences globales, historique de migration et statut d'intégrité.
- **Migration LocalStorage sécurisée :** Fonction `migrateFromLocalStorage()` idempotente, vérifiant les identifiants déjà présents, ne supprimant jamais les données d'origine avant validation et générant un rapport de migration exhaustif.
- **Diagnostic & Nettoyage :** Fonction `diagnoseStorage()` estimant la taille occupée et identifiant les blobs orphelins, avec fonction de nettoyage `cleanupOrphanedBlobs()`.

---

## 📦 Services Métier Opérationnels

- **`src/services/importService.ts` :**
  - Traitement par lot avec extraction des métadonnées EXIF (date, dimensions, appareil, focale, ISO, exposition) et coordonnées GPS décimales.
  - Détection automatique des doublons dès l'importation.
  - Support des formats JPEG, PNG, WEBP, AVIF et HEIC.
- **`src/services/exportService.ts` :**
  - Sauvegarde intégrale `createFullLibraryBackup()` : Archive ZIP incluant un manifeste versionné v2, empreintes d'intégrité SHA-256, albums et fichiers originaux.
  - Restauration certifiée `restoreFullLibraryBackup()` : Extraction, contrôle d'intégrité SHA-256 et réinjection transactionnelle dans IndexedDB.
  - Export unitaire ou global au format ZIP avec recadrage et filtres non destructifs appliqués via Canvas.
- **`src/services/duplicateService.ts` :**
  - Détection de doublons stricts (taille, résolution, nom, hash) et de quasi-doublons / prises de vue en rafale (proximité temporelle et similitude visuelle).
- **`src/services/qualityService.ts` :**
  - Scoring automatique de netteté, résolution, balance des lumières et qualité globale (0 à 100%).
- **`src/services/searchEngine.ts` :**
  - Moteur de recherche multicritère : texte intégral, favoris, période chronologique, localisation géographique, tags multiples, score de qualité minimal et appareil photo.
- **`src/services/smartAlbumService.ts` :**
  - Évaluation de critères dynamiques pour l'auto-remplissage des albums (ex: "Mes meilleures photos", "Photos de vacances 2026", "Photos géolocalisées").
- **`src/services/updateService.ts` :**
  - Gestion de version (`v2.4.0`), date de sortie (`10 Novembre 2026`), vérification manuelle via Service Worker & en-têtes réseau, mise à jour forcée (purge du CacheStorage sans impacter IndexedDB) et routine périodique de mise à jour automatique en arrière-plan.

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
