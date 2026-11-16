import React from 'react';
import { Link } from 'react-router-dom';
import { EDITORIAL_PHOTOS } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

const COPY = {
  fr: {
    eyebrow: 'Fonctionnalités principales',
    heading: 'Retrouvez, organisez et sublimez vos souvenirs — sans rien céder sur la maîtrise locale.',
    g01Tag: '01. Galerie personnelle',
    g01Title: 'Retrouvez vos photographies dans une galerie conçue autour de vos souvenirs.',
    g01Body:
      'Importez vos clichés par lots directement depuis votre appareil, sans téléversement sur serveur. Gallery Pro lit les métadonnées EXIF, classe votre photothèque par date de prise de vue et fluidifie les grandes collections dès 48 photos grâce à des miniatures WebP virtualisées.',
    g01Bullets: [
      'Grille chronologique, favoris étoilés et sélection multiple rapide',
      'Lecture EXIF complète (boîtier, focale, ouverture, ISO, GPS)',
      'Visionneuse plein écran et diaporama cadencé avec lecture aléatoire',
    ],
    g01DemoLink: 'Essayer la mini-galerie de démonstration',
    drawerAlt:
      "Capture réelle de l'application Gallery Pro montrant le menu latéral par catégories ouvert sur /gallery",
    drawerCaption: 'Menu latéral par catégories : Photothèque, Outils intelligents et Gestion des données',
    openGallery: 'Ouvrir /gallery →',
    svgAlt: "Illustration vectorielle complémentaire de l'architecture d'interface Gallery Pro",
    svgTitle: "Vue d'architecture (/app_preview.svg)",
    svgCaption: "Schéma synthétique de l'espace de travail local issu du dépôt.",
    cards: [
      {
        code: '02. Albums & Collections',
        title: 'Albums manuels ou dynamiques sans dupliquer vos fichiers',
        body: 'Créez des albums classiques avec photo de couverture personnalisée, ou définissez des albums intelligents évalués en direct selon vos critères (favoris, année, mois, lieu, GPS, netteté, appareil).',
        href: '/albums',
        isAnchor: false,
        linkLabel: "Voir les albums dans l'application →",
      },
      {
        code: '03. Recherche locale',
        title: 'Retrouvez une photo par mots-clés, saison ou critères EXIF',
        body: 'Le parseur naturalSearchService.ts combine règles lexicales locales et dictionnaire de 17 concepts synonymes en français et en anglais, sans serveur ni modèle LLM.',
        href: '#demo-recherche',
        isAnchor: true,
        linkLabel: 'Tester la recherche en direct ↓',
      },
      {
        code: '04. Carte & Retouche',
        title: 'Voyages sur carte Leaflet & retouche non destructive',
        body: 'Placez automatiquement vos clichés dotés de coordonnées GPS sur carte OpenStreetMap (connexion requise pour les tuiles) et retouchez vos images en conservant les originaux intacts dans IndexedDB.',
        href: '#demo-retouche',
        isAnchor: true,
        linkLabel: 'Tester le comparateur Avant/Après ↓',
      },
    ],
    s05Tag: '05. Souvenirs photographiques',
    s05Title: 'Redécouvrez les moments que vous aviez presque oubliés.',
    s05Body:
      'Le carrousel souvenirService.ts compose automatiquement des rétrospectives fondées strictement sur vos dates et lieux EXIF réels — sans jamais en inventer.',
    memories: [
      {
        photo: EDITORIAL_PHOTOS.coastalSunset,
        title: 'Ce jour-là, il y a un an et plus',
        detail: "Sélections anniversaires à 1, 2, 3, 5, 7 ou 10 ans d'après la date réelle du cliché.",
      },
      {
        photo: EDITORIAL_PHOTOS.forestTrail,
        title: "À cette période de l'année",
        detail: 'Moments des années passées dans une fenêtre de ±6 jours autour de la date du jour.',
      },
      {
        photo: EDITORIAL_PHOTOS.alpineLake,
        title: 'Escapades & Coups de cœur oubliés',
        detail: 'Regroupements par lieu renseigné (4 photos min.) et favoris anciens de plus de 6 mois.',
      },
    ],
  },
  en: {
    eyebrow: 'Core Features',
    heading: 'Find, organize, and refine your memories — without giving up local ownership.',
    g01Tag: '01. Personal Gallery',
    g01Title: 'Browse your photography in a gallery built around your memories.',
    g01Body:
      'Batch-import shots straight from your device with zero server upload. Gallery Pro extracts EXIF metadata, groups photos chronologically by capture date, and virtualizes rendering beyond 48 photos using dedicated WebP thumbnails.',
    g01Bullets: [
      'Chronological grid, starred favorites, and fast multi-selection',
      'Full EXIF readout (camera body, focal length, aperture, ISO, GPS)',
      'Fullscreen viewer and timed slideshow with shuffle playback',
    ],
    g01DemoLink: 'Try the interactive demo gallery',
    drawerAlt: 'Live screenshot of Gallery Pro showing the categorized sidebar drawer open on /gallery',
    drawerCaption: 'Categorized drawer navigation: Library, Smart Tools, and Data Management',
    openGallery: 'Open /gallery →',
    svgAlt: 'Vector schematic overview of the Gallery Pro workspace architecture',
    svgTitle: 'Architecture overview (/app_preview.svg)',
    svgCaption: 'High-level schematic of the local-first workspace included in the repository.',
    cards: [
      {
        code: '02. Albums & Collections',
        title: 'Manual or dynamic albums without duplicating files',
        body: 'Create classic albums with custom cover selection, or define dynamic smart albums evaluated live by your rules (favorites, year, month, location, GPS, sharpness, camera model).',
        href: '/albums',
        isAnchor: false,
        linkLabel: 'Open albums in the app →',
      },
      {
        code: '03. Local Search',
        title: 'Find any shot by keywords, season, or EXIF attributes',
        body: 'The naturalSearchService.ts parser combines local lexical rules with a 17-concept synonym dictionary — running completely locally without any server or LLM.',
        href: '#demo-recherche',
        isAnchor: true,
        linkLabel: 'Test the live search parser ↓',
      },
      {
        code: '04. Map & Editing',
        title: 'Trips on Leaflet map & non-destructive editing',
        body: 'Automatically plot GPS-tagged photos on an OpenStreetMap Leaflet view (tiles require an internet connection) and adjust images while leaving original blobs untouched in IndexedDB.',
        href: '#demo-retouche',
        isAnchor: true,
        linkLabel: 'Try the Before/After comparator ↓',
      },
    ],
    s05Tag: '05. Photographic Memories',
    s05Title: 'Rediscover moments you had almost forgotten.',
    s05Body:
      'The souvenirService.ts carousel automatically builds retrospectives grounded strictly in your real EXIF dates and locations — never fabricated.',
    memories: [
      {
        photo: EDITORIAL_PHOTOS.coastalSunset,
        title: 'On this day, years ago',
        detail: 'Anniversary picks at 1, 2, 3, 5, 7, or 10 years based on real capture dates.',
      },
      {
        photo: EDITORIAL_PHOTOS.forestTrail,
        title: 'Around this time of year',
        detail: 'Past moments captured within a ±6-day window of today’s calendar date.',
      },
      {
        photo: EDITORIAL_PHOTOS.alpineLake,
        title: 'Trips & Forgotten Favorites',
        detail: 'Location groupings (minimum 4 photos) and favorites older than 6 months.',
      },
    ],
  },
} as const;

export const FeaturesSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];

  return (
    <section
      id="fonctionnalites"
      aria-labelledby="features-heading"
      className="bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-24">
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold mb-3">
            {t.eyebrow}
          </p>
          <h2
            id="features-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
          >
            {t.heading}
          </h2>
        </div>

        {/* 01. Personal gallery & sidebar categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs font-semibold text-[#1E35D0]">{t.g01Tag}</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug">
              {t.g01Title}
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{t.g01Body}</p>
            <ul className="space-y-2 text-sm text-neutral-700 pt-1">
              {t.g01Bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                    check
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <a
                href="#demo-galerie"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E35D0] hover:underline"
              >
                <span>{t.g01DemoLink}</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_downward
                </span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <figure className="rounded-2xl overflow-hidden border border-neutral-200 bg-[#0F172A] shadow-lg">
              <img
                src="/screenshots/gallery-drawer.png"
                alt={t.drawerAlt}
                width={1366}
                height={860}
                loading="lazy"
                className="w-full h-auto block"
              />
              <figcaption className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <span>{t.drawerCaption}</span>
                <Link to="/gallery" className="text-[#93C5FD] hover:underline font-medium whitespace-nowrap shrink-0">
                  {t.openGallery}
                </Link>
              </figcaption>
            </figure>

            <figure className="rounded-xl overflow-hidden border border-neutral-200 bg-[#0F172A] flex flex-col sm:flex-row items-center gap-4 p-3">
              <img
                src="/app_preview.svg"
                alt={t.svgAlt}
                width={1200}
                height={680}
                loading="lazy"
                className="w-full sm:w-52 h-auto rounded-lg shrink-0 border border-white/10"
              />
              <figcaption className="text-xs text-neutral-300 leading-relaxed pr-2">
                <strong className="text-white block mb-0.5">{t.svgTitle}</strong>
                {t.svgCaption}
              </figcaption>
            </figure>
          </div>
        </div>

        {/* 02–04 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-neutral-200">
          {t.cards.map((card) => (
            <article
              key={card.code}
              className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs font-semibold text-[#1E35D0]">{card.code}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18191D] leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{card.body}</p>
              </div>
              {card.isAnchor ? (
                <a href={card.href} className="text-xs font-semibold text-[#1E35D0] hover:underline pt-2 inline-flex">
                  {card.linkLabel}
                </a>
              ) : (
                <Link to={card.href} className="text-xs font-semibold text-[#1E35D0] hover:underline pt-2 inline-flex">
                  {card.linkLabel}
                </Link>
              )}
            </article>
          ))}
        </div>

        {/* 05. Photographic Memories */}
        <div className="pt-8 border-t border-neutral-200 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">{t.s05Tag}</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug [text-wrap:balance]">
                {t.s05Title}
              </h3>
            </div>
            <p className="lg:col-span-5 text-sm text-neutral-600 leading-relaxed">{t.s05Body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.memories.map((mem) => (
              <figure key={mem.title} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
                <img
                  src={mem.photo.src}
                  alt={lang === 'en' ? mem.photo.altEn : mem.photo.alt}
                  width={640}
                  height={480}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                  <p className="font-serif text-lg font-medium">{mem.title}</p>
                  <p className="text-xs text-white/80 mt-1">{mem.detail}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
