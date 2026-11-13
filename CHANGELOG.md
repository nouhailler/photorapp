# Changelog

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/).

---

## [2.5.0] - 2026-11-13

### 🚀 Phase 3 : Intelligence Photographique, Performances & Fiabilité Produit
- **🧠 Intelligence Photographique Locale :**
  - Nouveau moteur de vision par ordinateur `aiVisionService.ts` : classification sémantique (Nature & Paysage, Plage & Mer, Architecture & Ville, Coucher de soleil, Portrait, Nuit) et mots-clés automatiques sans appel serveur.
  - Recherche en langage naturel `naturalSearchService.ts` (« Montagnes en hiver », « Chiens dans un jardin », « Photos avec GPS ») avec badges d'interprétation sémantique sur `/search`.
  - Carrousel de Souvenirs Rétrospectifs (`souvenirService.ts` & `SouvenirsCarousel.tsx`) intégré à la Galerie : « Ce jour-là il y a 1 an », « Même saison », « Escapades » et « Coups de cœur oubliés » sans jamais inventer de dates ni de lieux.
  - Regroupement local de visages (`faceService.ts`) strictement opt-in, renommage manuel et bouton d'effacement biométrique irréversible (`clearAllFaceData`).

- **⚡ Performance & Capacité jusqu'à 20 000 photos :**
  - Passage d'IndexedDB (`GalleryProDB`) en v3 avec store dédié `thumbnails` et pipeline WebP/JPEG (~20 Ko par miniature).
  - Virtualisation par fenêtrage de lignes dans `PhotoGrid.tsx` (> 48 photos) assurant un défilement fluide à 60 fps.
  - Suite de benchmark authentique (`benchmarkService.ts`) intégrée dans `/settings` mesurant chargement, recherche, filtres et mémoire de 1 000 à 20 000 photos.

- **🛡️ Fiabilité, Préservation & Suivi :**
  - Simulation et prévisualisation de restauration (`simulateRestoreBackup` & `RestoreSimulationModal`) avant toute écriture dans IndexedDB.
  - Outils de réparation dans `/sharing` et `/settings` : régénération en lot des miniatures manquantes et nettoyage des fichiers orphelins.
  - Centre d'Activité unifié (`activityService.ts` & `ActivityCenterModal`) accessible depuis la barre supérieure et le menu Hamburger avec annulation des tâches longues.

---

## [2.4.0] - 2026-11-10

### 🚀 Nouveautés & Fonctionnalités Majeures
- **🍔 Menu Hamburger Catégorisé :**
  - Ajout d'un tiroir latéral responsive regroupant toutes les fonctionnalités en 4 grandes familles :
    - *Photothèque & Souvenirs* (Galerie, Albums, Recherche)
    - *Outils Intelligents & Qualité* (Intelligence IA, Doublons, Carte GPS)
    - *Gestion des Données* (Sauvegardes, Importer, Santé Stockage)
    - *Système & Préférences* (Paramètres Système, Guide Novice, Mentions Légales)
  - Intégration d'un badge de version, de compteurs de photos et de raccourcis rapides.

- **⚙️ Paramètres Système & Mises à Jour :**
  - Nouvelle page dédiée accessible via `/settings` et la barre de navigation.
  - Affichage de la date officielle de sortie (`10 Novembre 2026`) et de la version `v2.4.0`.
  - Horodatage dynamique de la dernière vérification effectuée.
  - Bouton **« Vérifier les mises à jour »** : Déclenche une synchronisation immédiate avec le Service Worker et le réseau.
  - Bouton **« Forcer la mise à jour »** : Nettoie l'ensemble du cache applicatif (CacheStorage) et rafraîchit la page sans impacter les données IndexedDB (`GalleryProDB`).

- **🔄 Mises à Jour Automatiques en Arrière-Plan :**
  - Mise en place de `src/services/updateService.ts` avec vérification périodique transparente en tâche de fond (toutes les 15 minutes).
  - Détection automatique des nouvelles versions via `navigator.serviceWorker` et rechargement contrôlé.

- **⚖️ Onboarding avec Mentions Légales & Clause de Non-Responsabilité :**
  - Implémentation de `src/components/OnboardingModal.tsx` s'affichant lors du premier lancement.
  - Clause claire et explicite stipulant que **l'auteur de l'application n'est pas responsable des données fournies, importées ou stockées par les utilisateurs**.
  - Case à cocher obligatoire pour valider les conditions d'utilisation avant d'accéder à la photothèque.
  - Possibilité de réexaminer les mentions légales à tout moment depuis les paramètres ou le menu Hamburger.

- **💡 Mode Accompagnement Novice & Infobulles Contextuelles :**
  - Création de `HelpContext` et du composant `HelpTooltip` (`?`).
  - Infobulles interactives enrichies sur l'ensemble des écrans :
    - Curseurs de retouche (luminosité, contraste, saturation, exposition, température, teinte, ombres, vignettage).
    - Champs de recherche avancée (mots-clés, dates, filtres de qualité, coordonnées GPS).
    - Actions de sauvegarde, de restauration et d'importation.
  - Interrupteur global permettant d'activer ou masquer l'ensemble des infobulles selon le niveau de l'utilisateur.

- **📲 Bouton « Installer l'application » (PWA) :**
  - Création du hook `usePWAInstall` et du composant `PWAInstallButton`.
  - Détection native du prompt `beforeinstallprompt` pour installer Gallery Pro sur mobile et bureau en un clic.
  - Guide pas-à-pas illustré pour les utilisateurs iOS Safari (« Partager » > « Sur l'écran d'accueil »).

- **🎨 Identité Visuelle, Logo & Documentation :**
  - Nouveau logo vectoriel haute résolution dans `/public/logo.svg`.
  - Aperçu graphique complet dans `/public/app_preview.svg` intégré au `README.md`.
  - Icônes et métadonnées PWA actualisées.

---

## [2.3.0] - 2026-11-09

### Ajouté
- **Sécurisation des Données & IndexedDB :**
  - Migration LocalStorage indépendante et idempotente avec rapport détaillé.
  - Sauvegarde intégrale `.zip` avec manifeste v2 et empreintes SHA-256.
  - Restauration certifiée avec vérification d'intégrité et rollback en cas d'anomalie.
  - Diagnostic de santé IndexedDB et suppression sécurisée des blobs orphelins.
- **Moteur de Recherche Avancé :** Recherche multicritère (tags, date, GPS, note qualité, appareil).
- **Détection de Doublons & Similitudes :** Détection stricte et détection de rafales / quasi-doublons.
- **Scoring Qualité Photo :** Évaluation automatique de netteté, résolution et équilibre lumineux.

---

## [0.1.0] - 2026-06-08

### Ajouté
- Initialisation du projet Vite + React + TypeScript.
- Modèle de données initial et composants de galerie de base.
