import React from 'react';
import { Link } from 'react-router-dom';

const CAPABILITIES = [
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
];

export const IntelligenceSection: React.FC = () => {
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
              Intelligence photographique locale
            </p>
            <h2
              id="intelligence-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              Des algorithmes transparents exécutés dans votre navigateur, sans serveur distant.
            </h2>
          </div>

          <p className="lg:col-span-5 text-sm text-neutral-600 leading-relaxed">
            Gallery Pro privilégie la clarté technique aux promesses exagérées : l&apos;analyse des scènes repose sur
            des règles algorithmiques de traitement d&apos;image — et non sur un réseau neuronal entraîné — tandis que le
            regroupement des personnes est purement expérimental, sans biométrie faciale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAPABILITIES.map((item) => (
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-neutral-200 px-6 py-4 text-sm">
          <p className="text-neutral-700">
            Consultez les résultats calculés par le moteur dans le module <strong>Intelligence &amp; Qualité</strong>.
          </p>
          <Link
            to="/ia"
            className="font-semibold text-[#1E35D0] hover:underline whitespace-nowrap shrink-0"
          >
            Ouvrir le module d&apos;analyse →
          </Link>
        </div>
      </div>
    </section>
  );
};
