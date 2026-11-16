import React from 'react';
import { useLandingLang } from './LandingLangContext';

const FLOW_NODES = {
  fr: [
    'Photographies importées',
    'Navigateur',
    'IndexedDB (GalleryProDB v3)',
    'Organisation · Recherche · Retouche · Sauvegarde',
  ],
  en: [
    'Imported photographs',
    'Browser runtime',
    'IndexedDB (GalleryProDB v3)',
    'Organize · Search · Edit · Back up',
  ],
} as const;

const NETWORK_DISCLOSURES = {
  fr: [
    {
      resource: 'Polices Google Fonts & Material Symbols',
      purpose: "Chargement typographique et icônes de l'interface depuis index.html, avec repli système hors ligne.",
    },
    {
      resource: 'Tuiles OpenStreetMap (tile.openstreetmap.org)',
      purpose: "Affichage des fonds cartographiques dans l'onglet Carte GPS (requiert une connexion Internet).",
    },
    {
      resource: "Jeu d'exemple au démarrage à vide",
      purpose: '3 images initiales distantes (mockData.ts) remplacées par vos propres blobs locaux dès le premier import.',
    },
    {
      resource: 'Catalogue OpenRouter (optionnel)',
      purpose: 'Requête manuelle sur /ia vers openrouter.ai/api/v1/models uniquement pour lister les modèles gratuits.',
    },
    {
      resource: 'Vérification des mises à jour du site',
      purpose: "Requête HEAD légère pour comparer l'en-tête ETag et rafraîchir le Service Worker PWA.",
    },
  ],
  en: [
    {
      resource: 'Google Fonts & Material Symbols',
      purpose: 'Loads interface typography and icon fonts declared in index.html, falling back gracefully offline.',
    },
    {
      resource: 'OpenStreetMap Tiles (tile.openstreetmap.org)',
      purpose: 'Renders map tiles inside the GPS Map tab (requires an internet connection).',
    },
    {
      resource: 'Initial Empty-State Sample Photos',
      purpose: '3 remote starter photos (mockData.ts) replaced by your own local blobs as soon as you import.',
    },
    {
      resource: 'OpenRouter Catalog (optional)',
      purpose: 'Manual request in /ia to openrouter.ai/api/v1/models solely to list free model IDs.',
    },
    {
      resource: 'App Update Check',
      purpose: 'Lightweight HEAD request to compare ETag headers and refresh the PWA Service Worker.',
    },
  ],
} as const;

const COPY = {
  fr: {
    eyebrow: 'Confidentialité & Architecture Local-First',
    heading: "Vos photos sont personnelles. Leur stockage devrait l'être aussi.",
    p1: (
      <>
        Les fichiers maîtres, leurs miniatures WebP et vos métadonnées résident dans la base{' '}
        <strong className="text-white">IndexedDB</strong> de votre navigateur (
        <code className="font-mono text-xs text-[#BCC2FF]">GalleryProDB</code> version 3). Aucun compte n&apos;est exigé
        et aucun téléversement vers un cloud applicatif n&apos;est effectué.
      </>
    ),
    p2: "Vos photographies importées et leurs traitements restent locaux. Certaines ressources de l'interface et fonctions optionnelles peuvent néanmoins nécessiter une connexion Internet.",
    flowTitle: 'Chaîne de traitement des fichiers importés',
    netTitle: 'Transparence réseau : ce qui se connecte, et pourquoi',
    netSubtitle:
      'Pour éviter toute affirmation trompeuse, voici l’inventaire exact des appels réseau externes présents dans le code source :',
  },
  en: {
    eyebrow: 'Privacy & Local-First Architecture',
    heading: 'Your photos are personal. Their storage should be too.',
    p1: (
      <>
        Original master files, WebP thumbnails, and metadata reside inside your browser&apos;s{' '}
        <strong className="text-white">IndexedDB</strong> (
        <code className="font-mono text-xs text-[#BCC2FF]">GalleryProDB</code> v3). No account is required and no files
        are uploaded to an application cloud.
      </>
    ),
    p2: 'Your imported photographs and local processing stay on your device. A few interface assets and optional features still issue external requests when online.',
    flowTitle: 'Local-first pipeline for imported files',
    netTitle: 'Network transparency: what connects, and why',
    netSubtitle:
      'To avoid misleading zero-network claims, here is the exact inventory of external requests present in the codebase:',
  },
} as const;

export const PrivacySection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];
  const nodes = FLOW_NODES[lang];
  const disclosures = NETWORK_DISCLOSURES[lang];

  return (
    <section
      id="confidentialite"
      aria-labelledby="privacy-heading"
      className="bg-[#101218] text-neutral-100 py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#6EFBBD] font-semibold">
              {t.eyebrow}
            </p>
            <h2
              id="privacy-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-white leading-tight [text-wrap:balance]"
            >
              {t.heading}
            </h2>
          </div>

          <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
            <p>{t.p1}</p>
            <p className="text-neutral-200 font-medium">{t.p2}</p>
          </div>
        </div>

        <div className="bg-[#181B24] rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-neutral-400 mb-5">{t.flowTitle}</div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
            {nodes.map((node, index) => (
              <li
                key={node}
                className="relative bg-[#101218] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-2"
              >
                <span className="font-mono text-xs text-[#6EFBBD] tabular-nums">0{index + 1}.</span>
                <span className="text-sm font-semibold text-white leading-snug">{node}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <h3 className="font-landing text-xl font-bold text-white">{t.netTitle}</h3>
            <p className="text-sm text-neutral-400">{t.netSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disclosures.map((item) => (
              <div key={item.resource} className="bg-[#181B24] rounded-xl border border-white/10 p-4 space-y-1.5">
                <div className="text-sm font-semibold text-white">{item.resource}</div>
                <p className="text-xs text-neutral-300 leading-relaxed">{item.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
