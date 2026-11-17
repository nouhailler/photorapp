import { defineScenario, type RuntimeStep } from '@nouhailler/video-studio'

export default defineScenario<RuntimeStep>({
  id: 'tutoriel-fr',
  video: {
    title: 'Tutoriel complet Gallery Pro — Photothèque Local-First',
    description:
      'Tour guidé complet de Gallery Pro : prise en main, visionneuse EXIF, retouche non destructive, albums intelligents, recherche sémantique, IA locale, carte GPS et sauvegardes ZIP SHA-256.',
    language: 'fr',
    voiceEnabled: true,
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    clock: '2026-11-17T10:30:00+01:00',
    location: { city: 'Paris', lat: 48.8566, lng: 2.3522 },
    subtitles: { export: true, burnIn: false },
    intro: {
      eyebrow: 'Tutoriel complet',
      title: 'Maîtriser Gallery Pro',
      tagline: 'Photothèque privée, retouche et intelligence 100 % locales',
      narration:
        "Bienvenue dans ce tutoriel complet sur Gallery Pro. Nous allons parcourir l'interface, retoucher une photo, créer des albums intelligents, lancer la recherche sémantique, explorer l'IA locale et sécuriser vos sauvegardes.",
      minDurationMs: 5500,
    },
    outro: {
      eyebrow: 'Pour aller plus loin',
      title: 'Gallery Pro',
      tagline: 'Vos souvenirs restent chez vous',
      bullets: [
        'Stockage 100 % local dans IndexedDB, sans compte',
        'Retouche non destructive, albums intelligents et recherche sémantique',
        'Analyse IA locale, carte GPS et sauvegardes ZIP SHA-256',
      ],
      links: [{ label: 'Ouvrir Gallery Pro', url: 'https://photorapp.swinux.ch/' }],
      narration:
        "Vous connaissez désormais l'essentiel de Gallery Pro : retouche non destructive, recherche intelligente, analyse locale et sauvegardes autonomes. Essayez l'application directement sur photorapp.swinux.ch.",
      minDurationMs: 7000,
    },
  },
  scenario: {
    name: 'tutoriel-fr',
    label: 'Tutoriel complet (FR)',
    description: 'Découverte pas à pas des 6 grands pôles de Gallery Pro',
    steps: [
      // ── Chapitre 1 : Découverte et prise en main ─────────────────────────
      {
        type: 'highlight',
        target: 'hero-value-prop',
        narrate:
          'Gallery Pro est une photothèque Local-First utilisable directement dans votre navigateur. Vos photos restent chez vous dans IndexedDB, sans compte ni abonnement.',
        video: { chapter: 'Découverte et prise en main', transition: 'fade', readingPause: 800 },
      },
      {
        type: 'navigate',
        target: 'hero-launch-app',
        narrate: "Ouvrons maintenant l'espace de travail pour découvrir l'interface.",
      },
      {
        type: 'click',
        target: 'nav-menu-button',
        narrate: 'Le menu latéral regroupe toutes les fonctions par catégorie : galerie, analyse locale, sauvegarde et réglages.',
        video: { zoom: 1.25, readingPause: 900 },
      },
      {
        type: 'highlight',
        target: 'hamburger-drawer',
        narrate: "Chaque écran reste accessible à tout moment depuis ce tiroir ou depuis la barre de navigation inférieure.",
      },
      {
        type: 'click',
        target: 'hamburger-close',
        narrate: 'Refermons le menu pour explorer la galerie chronologique.',
        video: { zoom: 1.2 },
      },

      // ── Chapitre 2 : Galerie, filtres et visionneuse ─────────────────────
      {
        type: 'highlight',
        target: 'souvenirs-carousel',
        narrate: 'En haut de la galerie, le carrousel Souvenirs retrouve les clichés pris à la même date les années précédentes.',
        video: { chapter: 'Galerie, filtres et visionneuse', transition: 'fade', readingPause: 900 },
      },
      {
        type: 'highlight',
        target: 'gallery-help-filters',
        narrate: "Chaque pastille d'aide explique les commandes lorsque le guide débutant est activé.",
        video: { zoom: 1.35 },
      },
      {
        type: 'click',
        target: 'gallery-filter-favorites',
        narrate: 'Les filtres rapides isolent en un clic vos favoris ou vos clichés géolocalisés.',
      },
      {
        type: 'click',
        target: 'gallery-filter-all',
        narrate: 'Réaffichons toute la photothèque avant de tester le mode diaporama.',
      },
      {
        type: 'click',
        target: 'gallery-slideshow-btn',
        narrate: 'Le diaporama plein écran offre un défilement automatique avec réglage de vitesse et lecture aléatoire.',
        video: { zoom: 1.2, readingPause: 800 },
      },
      {
        type: 'click',
        target: 'slideshow-close',
        narrate: 'Quittons le diaporama pour ouvrir une photographie en détail.',
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'photo-card-demo-snow-peaks',
        narrate: 'La visionneuse affiche la photo en pleine définition avec ses actions rapides.',
      },
      {
        type: 'click',
        target: 'detail-info-btn',
        narrate: "L'icône d'information ouvre le panneau des métadonnées.",
        video: { zoom: 1.3 },
      },
      {
        type: 'highlight',
        target: 'detail-info-panel',
        narrate: "On y lit l'appareil photo, l'ouverture, la vitesse, l'ISO, les coordonnées GPS et le score de netteté.",
        video: { readingPause: 1200 },
      },

      // ── Chapitre 3 : Retouche photo non destructive ──────────────────────
      {
        type: 'click',
        target: 'detail-info-close',
        narrate: 'Passons à la retouche non destructive : vos réglages sont mémorisés sans modifier le fichier original.',
        video: { chapter: 'Retouche photo non destructive', transition: 'fade', zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'detail-edit-btn',
        narrate: "Ouvrons l'éditeur complet depuis le bouton Ajuster.",
      },
      {
        type: 'click',
        target: 'editor-auto-adjust',
        narrate: "L'auto-ajustement équilibre en un geste contraste, exposition, saturation et ombres.",
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'editor-tab-filters',
        narrate: "L'onglet Filtres propose sept rendus colorimétriques appliqués en direct.",
      },
      {
        type: 'click',
        target: 'editor-filter-hdr',
        narrate: 'Appliquons le filtre HDR pour souligner les reliefs du paysage.',
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'editor-tab-crop',
        narrate: 'Dans Recadrage, choisissez un ratio prédéfini ou rognez librement chaque bord.',
      },
      {
        type: 'click',
        target: 'editor-ratio-169',
        narrate: 'Passons au format panoramique 16:9.',
        video: { zoom: 1.2 },
      },
      {
        type: 'highlight',
        target: 'editor-compare-btn',
        narrate: "Maintenez Comparer à tout moment pour revoir l'image originale avant retouche.",
        video: { zoom: 1.3 },
      },
      {
        type: 'click',
        target: 'editor-save-btn',
        narrate: 'Enregistrons ces modifications non destructives.',
      },
      {
        type: 'click',
        target: 'detail-close-btn',
        narrate: 'Revenons à la vue principale pour organiser nos albums.',
        video: { zoom: 1.2 },
      },

      // ── Chapitre 4 : Albums et recherche intelligente ────────────────────
      {
        type: 'navigate',
        target: 'tab-albums',
        narrate: "L'onglet Albums rassemble collections manuelles et albums intelligents dynamiques.",
        video: { chapter: 'Albums et recherche intelligente', transition: 'fade' },
      },
      {
        type: 'click',
        target: 'albums-new-btn',
        narrate: 'Créons un nouvel album automatique sans dupliquer de fichiers.',
      },
      {
        type: 'type',
        target: 'albums-modal-title-input',
        text: 'Sélection Suisse',
        narrate: "Saisissons un titre puis activons l'option Album Intelligent.",
      },
      {
        type: 'click',
        target: 'albums-modal-smart-toggle',
        narrate: "L'album se remplit alors automatiquement selon une règle précise.",
        video: { zoom: 1.2 },
      },
      {
        type: 'highlight',
        target: 'albums-modal-smart-select',
        narrate: 'On peut filtrer par favoris, GPS, année, mot-clé, lieu ou même photos floues à trier.',
        video: { readingPause: 1100 },
      },
      {
        type: 'click',
        target: 'albums-modal-submit',
        narrate: 'Validons : la collection se met à jour en temps réel.',
      },
      {
        type: 'scroll',
        target: 'albums-smart-spaces',
        narrate: 'Plus bas, des espaces intelligents créent des albums prêts à l’emploi en un clic.',
        video: { readingPause: 900 },
      },
      {
        type: 'navigate',
        target: 'tab-search',
        narrate: "Passons à l'onglet Recherche pour tester le moteur multicritères hors ligne.",
      },
      {
        type: 'type',
        target: 'search-input',
        text: 'montagne',
        narrate: 'Saisissez un mot-clé naturel comme montagne pour activer la détection sémantique.',
      },
      {
        type: 'highlight',
        target: 'search-semantic-badges',
        narrate: 'Les badges de scène et tags associés filtrent aussitôt la photothèque.',
        video: { readingPause: 1100 },
      },
      {
        type: 'click',
        target: 'search-more-filters-btn',
        narrate: 'Les filtres avancés croisent aussi mois, album, appareil photo ou plage de dates.',
        video: { readingPause: 800 },
      },

      // ── Chapitre 5 : Intelligence locale et carte GPS ────────────────────
      {
        type: 'navigate',
        target: 'tab-ia',
        narrate: "L'onglet IA et Qualité exécute toute la vision par ordinateur localement, sans envoyer vos clichés.",
        video: { chapter: 'Intelligence locale et carte GPS', transition: 'fade' },
      },
      {
        type: 'click',
        target: 'ia-blurry-review-btn',
        narrate: 'Le module Nettoyage repère les photos floues ou mal exposées pour faciliter le tri.',
      },
      {
        type: 'click',
        target: 'ia-blurry-modal-close',
        narrate: 'Vous choisissez toujours quoi conserver ou supprimer. Refermons cette revue.',
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'ia-duplicates-review-btn',
        narrate: 'La détection de doublons combine empreinte exacte SHA-256 et similarité dHash.',
      },
      {
        type: 'click',
        target: 'ia-duplicates-modal-close',
        narrate: 'Gardez uniquement le meilleur exemplaire de chaque prise.',
        video: { zoom: 1.2 },
      },
      {
        type: 'highlight',
        target: 'ia-semantic-section',
        narrate: 'La classification sémantique classe automatiquement vos scènes en nature, ville, plage ou crépuscule.',
        video: { readingPause: 1000 },
      },
      {
        type: 'highlight',
        target: 'ia-faces-section',
        narrate: 'Le regroupement de visages reste facultatif, local et effaçable de façon irréversible.',
      },
      {
        type: 'highlight',
        target: 'ia-map-section',
        narrate: 'Enfin, la carte interactive positionne uniquement les clichés dotés de coordonnées GPS réelles.',
        video: { readingPause: 1200 },
      },

      // ── Chapitre 6 : Sauvegarde, paramètres et mode hors-ligne ───────────
      {
        type: 'navigate',
        target: 'tab-sharing',
        narrate: "L'onglet Sauvegarde centralise l'import, la restauration et l'exportation complète.",
        video: { chapter: 'Sauvegarde, paramètres et mode hors-ligne', transition: 'fade' },
      },
      {
        type: 'highlight',
        target: 'sharing-backup-card',
        narrate: 'Exportez toute votre bibliothèque dans une archive ZIP avec manifeste vérifié SHA-256.',
        video: { readingPause: 1100 },
      },
      {
        type: 'highlight',
        target: 'sharing-diagnostic-section',
        narrate: "Le diagnostic IndexedDB suit l'espace occupé et répare les miniatures ou fichiers orphelins.",
        video: { readingPause: 1200 },
      },
      {
        type: 'navigate',
        target: 'tab-settings',
        narrate: 'Terminons par les Paramètres système pour personnaliser votre espace.',
      },
      {
        type: 'highlight',
        target: 'settings-pwa-card',
        narrate: 'Installez Gallery Pro comme PWA sur mobile ou ordinateur pour consulter vos photos hors ligne.',
        video: { readingPause: 1000 },
      },
      {
        type: 'highlight',
        target: 'nav-activity-button',
        narrate: "Le centre d'activité en haut suit vos tâches en arrière-plan, et un benchmark teste jusqu'à vingt mille photos.",
        video: { zoom: 1.35, readingPause: 1000 },
      },
    ],
  },
})
