import React from 'react';
import { Link } from 'react-router-dom';
import { useLandingLang } from './LandingLangContext';

const CAPABILITIES = {
  fr: [
    {
      code: '01',
      title: 'Classification heuristique des scènes',
      detail:
        'Analyse de pixels sur Canvas (180 px) combinant palette RGB dominante (5 teintes), histogrammes HSV, segmentation ciel/sol et gradients de contours type Sobel pour suggérer des étiquettes et mots-clés automatiques.',
      tag: 'Heuristiques déterministes · Sans modèle neuronal',
    },
    {
      code: '02',
      title: 'Netteté (Laplacien) & Exposition',
      detail:
        'Calcul de la variance du Laplacien (seuil de flou < 120) et de la luminance moyenne (< 35 sous-exposée, > 225 surexposée) pour produire un indicateur de tri de 5 à 100.',
      tag: 'Indicateur d’aide au tri · Décision manuelle',
    },
    {
      code: '03',
      title: 'Doublons exacts (SHA-256) & Rafales (dHash)',
      detail:
        'Détection stricte des copies bit-à-bit via empreinte SHA-256 et repérage des prises visuellement proches via hachage perceptuel dHash 64 bits (distance de Hamming <= 6).',
      tag: 'Empreintes locales · Validation utilisateur requise',
    },
    {
      code: '04',
      title: 'Regroupement expérimental des personnes (opt-in)',
      detail:
        'Module désactivé par défaut regroupant par paquets de 4 les clichés déjà étiquetés portrait pour un nommage manuel, avec bouton d’effacement complet et irréversible du store IndexedDB dédié.',
      tag: 'Expérimental · Aucune reconnaissance biométrique',
    },
  ],
  en: [
    {
      code: '01',
      title: 'Heuristic scene classification',
      detail:
        'Client-side Canvas pixel sampling (180 px) combining a 5-color RGB palette, HSV histograms, sky/ground spatial segmentation, and Sobel-style edge gradients to suggest automatic scene labels and keywords.',
      tag: 'Deterministic heuristics · No neural network',
    },
    {
      code: '02',
      title: 'Sharpness (Laplacian) & Exposure',
      detail:
        'Computes Laplacian variance (blur threshold < 120) and mean luminance (< 35 underexposed, > 225 overexposed) to produce a triage score from 5 to 100.',
      tag: 'Triage indicator · Manual confirmation',
    },
    {
      code: '03',
      title: 'Exact Duplicates (SHA-256) & Bursts (dHash)',
      detail:
        'Strictly flags bit-identical files using SHA-256 hashes and identifies visually similar burst captures with 64-bit perceptual dHash (Hamming distance <= 6).',
      tag: 'Local fingerprints · User confirmation required',
    },
    {
      code: '04',
      title: 'Experimental People Grouping (opt-in)',
      detail:
        'Disabled by default. Groups photos already tagged as portraits in batches of 4 for manual naming, with a one-click irreversible wipe of the dedicated IndexedDB store.',
      tag: 'Experimental · No facial biometrics',
    },
  ],
} as const;

const COPY = {
  fr: {
    eyebrow: 'Intelligence photographique locale',
    heading: 'Des algorithmes transparents exécutés dans votre navigateur, sans serveur distant.',
    intro:
      "Gallery Pro privilégie la clarté technique aux promesses exagérées : l'analyse des scènes repose sur des règles algorithmiques de traitement d'image — et non sur un réseau neuronal entraîné — tandis que le regroupement des personnes est purement expérimental, sans biométrie faciale.",
    imgAlt:
      "Capture réelle de l'onglet /ia affichant le compteur d'analyse locale, les groupes de doublons, les catégories sémantiques et la carte Leaflet GPS",
    imgCaption:
      "Capture réelle de l'onglet /ia : bilan d'analyse locale, détection de doublons SHA-256/dHash et carte Leaflet OpenStreetMap des clichés géolocalisés.",
    footerText: (
      <>
        Consultez les résultats calculés par le moteur dans le module <strong>Intelligence &amp; Qualité</strong>.
      </>
    ),
    cta: "Ouvrir le module d'analyse →",
  },
  en: {
    eyebrow: 'Local Photo Intelligence',
    heading: 'Transparent algorithms running inside your browser, with no remote server.',
    intro:
      'Gallery Pro favors technical honesty over inflated AI claims: scene tagging uses deterministic image-processing heuristics — not a trained neural network — while people grouping is strictly experimental with zero biometric face recognition.',
    imgAlt:
      'Live screenshot of the /ia tab showing local analysis counters, duplicate groups, semantic scene labels, and the Leaflet GPS map',
    imgCaption:
      'Live screenshot of the /ia view: local analysis summary, SHA-256/dHash duplicate detection, and OpenStreetMap Leaflet pins for geotagged shots.',
    footerText: (
      <>
        Inspect scores and clusters computed locally inside the <strong>Intelligence &amp; Quality</strong> tab.
      </>
    ),
    cta: 'Open the analysis module →',
  },
} as const;

export const IntelligenceSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];
  const items = CAPABILITIES[lang];

  return (
    <section
      id="intelligence"
      aria-labelledby="intelligence-heading"
      className="bg-[#F2F1EC] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              {t.eyebrow}
            </p>
            <h2
              id="intelligence-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              {t.heading}
            </h2>
          </div>

          <p className="lg:col-span-5 text-sm text-neutral-600 leading-relaxed">{t.intro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <article
              key={item.code}
              className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-7 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs font-semibold text-[#1E35D0] tabular-nums">
                    {item.code}.
                  </span>
                  <span className="text-xs font-medium text-neutral-500">{item.tag}</span>
                </div>
                <h3 className="font-landing text-xl font-bold text-[#18191D]">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <figure className="rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
          <img
            src="/screenshots/ia-analysis-map.png"
            alt={t.imgAlt}
            width={1366}
            height={1180}
            loading="lazy"
            className="w-full h-auto block"
          />
          <figcaption className="px-5 py-3 bg-[#14161D] text-neutral-300 text-xs flex flex-wrap items-center justify-between gap-2">
            <span>{t.imgCaption}</span>
          </figcaption>
        </figure>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-neutral-200 px-6 py-4 text-sm">
          <p className="text-neutral-700">{t.footerText}</p>
          <Link to="/ia" className="font-semibold text-[#1E35D0] hover:underline whitespace-nowrap shrink-0">
            {t.cta}
          </Link>
        </div>
      </div>
    </section>
  );
};
