import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { parseNaturalLanguageQuery } from '../../services/naturalSearchService';
import { EDITORIAL_PHOTOS } from './landingMedia';

const SAMPLE_QUERIES = [
  'Montagnes en hiver',
  'Photos de plage avec GPS',
  'Coups de cœur 2024 à Paris',
  'Photos floues',
];

const EDITOR_PRESETS = [
  { id: 'original', label: 'Original', filterCss: 'none' },
  { id: 'vivid', label: 'Vivid', filterCss: 'saturate(135%) contrast(108%)' },
  { id: 'bw', label: 'Noir & Blanc', filterCss: 'grayscale(100%) contrast(115%)' },
  { id: 'cinema', label: 'Cinéma', filterCss: 'contrast(112%) saturate(90%) sepia(18%)' },
];

export const FeaturesSection: React.FC = () => {
  const [selectedQuery, setSelectedQuery] = useState<string>(SAMPLE_QUERIES[0]);
  const [sliderPosition, setSliderPosition] = useState<number>(52);
  const [selectedPreset, setSelectedPreset] = useState<string>('vivid');

  // Exécution réelle du parseur lexical de Gallery Pro sur l'exemple sélectionné
  const parsedResult = useMemo(() => parseNaturalLanguageQuery(selectedQuery), [selectedQuery]);
  const activePreset = EDITOR_PRESETS.find((p) => p.id === selectedPreset) || EDITOR_PRESETS[1];

  return (
    <section
      id="fonctionnalites"
      aria-labelledby="features-heading"
      className="bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {/* En-tête éditorial */}
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold mb-3">
            Fonctionnalités principales
          </p>
          <h2
            id="features-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
          >
            Chaque étape du cycle de vie de vos photographies, maîtrisée en local.
          </h2>
        </div>

        {/* 01 / A. Galerie personnelle & Illustration de l'interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs font-semibold text-[#1E35D0]">01. Galerie personnelle</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug">
              Retrouvez vos photographies dans une galerie organisée autour de vos souvenirs.
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Importez vos fichiers par lots sans téléversement serveur. Gallery Pro extrait automatiquement les
              métadonnées EXIF, regroupe vos clichés par date de prise de vue et virtualise l&apos;affichage
              au-delà de 48 photos grâce à des miniatures WebP dédiées.
            </p>
            <ul className="space-y-2 text-sm text-neutral-700 pt-1">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                  check
                </span>
                <span>Galerie chronologique, gestion des favoris et sélection multiple</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                  check
                </span>
                <span>Importation par lots avec lecture EXIF (appareil, ouverture, ISO, focale, GPS)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                  check
                </span>
                <span>Consultation plein écran et diaporama cadencé avec lecture aléatoire</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <figure className="rounded-2xl overflow-hidden border border-neutral-200 bg-[#0F172A] shadow-lg">
              <img
                src="/app_preview.svg"
                alt="Illustration vectorielle de l'architecture d'interface Gallery Pro avec menu latéral, grille chronologique et mode aide"
                width={1200}
                height={680}
                loading="lazy"
                className="w-full h-auto block"
              />
              <figcaption className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <span>Illustration vectorielle de l&apos;espace de travail Gallery Pro (ressource du dépôt)</span>
                <Link to="/gallery" className="text-[#93C5FD] hover:underline font-medium">
                  Ouvrir l&apos;application réelle →
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* 02 / B. Albums manuels & dynamiques + C. Recherche par intentions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-6 border-t border-neutral-200">
          {/* B. Albums */}
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs font-semibold text-[#1E35D0]">02. Albums &amp; Collections</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug">
              Organisez vos photos comme vous le souhaitez, ou laissez les collections intelligentes faire le travail.
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Créez des albums manuels avec gestion libre de la photo de couverture, ou définissez des albums
              intelligents évalués dynamiquement selon vos critères (année, mois, lieu, favoris, GPS, tags,
              modèle d&apos;appareil ou flou). Chaque suppression met à jour de façon atomique les compteurs et
              couvertures dans IndexedDB.
            </p>
            <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2 text-xs text-neutral-700">
              <div className="font-semibold text-[#18191D]">Critères combinables en album intelligent</div>
              <p className="text-neutral-600 leading-relaxed">
                Favoris · Année &amp; mois · Plage de dates · Tag précis · Lieu · Présence GPS · État de netteté ·
                Modèle d&apos;appareil photo
              </p>
            </div>
          </div>

          {/* C. Recherche lexicale interactive en direct */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">
                03. Recherche avancée et par intentions
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#18191D]">
                Une recherche qui comprend vos critères courants
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Testez ci-dessous le parseur réel de Gallery Pro (<code className="font-mono text-xs">naturalSearchService.ts</code>) :
                il repose sur des règles lexicales locales et un dictionnaire de 17 concepts synonymes en français et
                en anglais, sans modèle LLM ni recherche vectorielle.
              </p>
            </div>

            {/* Sélecteur interactif de requêtes */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples de requêtes de recherche">
              {SAMPLE_QUERIES.map((q) => {
                const active = selectedQuery === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuery(q)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#1E35D0] text-white border-[#1E35D0]'
                        : 'bg-[#FAF9F6] text-neutral-700 border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    « {q} »
                  </button>
                );
              })}
            </div>

            {/* Résultat réel extrait par parseNaturalLanguageQuery */}
            <div className="bg-[#F2F1EC] rounded-xl p-4 font-mono text-xs space-y-2 text-neutral-800">
              <div className="text-neutral-500">Filtres structurés extraits localement :</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-500">isFavorite :</span>{' '}
                  <span className="font-semibold">
                    {parsedResult.extractedFilters.isFavorite ? 'true (Favoris)' : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">hasGps :</span>{' '}
                  <span className="font-semibold">
                    {parsedResult.extractedFilters.hasGps ? 'true (Avec GPS)' : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">isBlurry :</span>{' '}
                  <span className="font-semibold">
                    {parsedResult.extractedFilters.isBlurry ? 'true (Flou détecté)' : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Période :</span>{' '}
                  <span className="font-semibold tabular-nums">
                    {[
                      parsedResult.extractedFilters.year ? `année ${parsedResult.extractedFilters.year}` : null,
                      parsedResult.extractedFilters.month ? `mois ${parsedResult.extractedFilters.month}` : null,
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </span>
                </div>
              </div>
              {parsedResult.semanticTags.length > 0 && (
                <div className="pt-1 border-t border-neutral-300/70">
                  <span className="text-neutral-500">Synonymes sémantiques :</span>{' '}
                  <span className="text-[#1E35D0] font-medium">
                    {parsedResult.semanticTags.join(' · ')}
                  </span>
                </div>
              )}
              {parsedResult.extractedFilters.query && (
                <div>
                  <span className="text-neutral-500">Mots-clés texte résiduels :</span>{' '}
                  <span className="font-semibold">{parsedResult.extractedFilters.query}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Limite documentée : une saison (hiver, printemps, été, automne) cible son mois central (ex. mois 1 pour
              l&apos;hiver), et les attributs hors dictionnaire (comme les couleurs) sont traités comme recherche
              textuelle simple.
            </p>
          </div>
        </div>

        {/* 04 / E. Vos souvenirs photographiques */}
        <div className="pt-6 border-t border-neutral-200 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">04. Souvenirs photographiques</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug [text-wrap:balance]">
                Redécouvrez les moments que vous aviez presque oubliés.
              </h3>
            </div>
            <p className="lg:col-span-5 text-sm text-neutral-600 leading-relaxed">
              Le carrousel <code className="font-mono text-xs">souvenirService.ts</code> compose automatiquement des
              rétrospectives fondées strictement sur vos dates et lieux EXIF réels — sans jamais en inventer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
              <img
                src={EDITORIAL_PHOTOS.coastalSunset.src}
                alt={EDITORIAL_PHOTOS.coastalSunset.alt}
                width={640}
                height={480}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-serif text-lg font-medium">Ce jour-là, il y a un an et plus</p>
                <p className="text-xs text-white/80 mt-1">
                  Sélections anniversaires à 1, 2, 3, 5, 7 ou 10 ans d&apos;après la date réelle du cliché.
                </p>
              </figcaption>
            </figure>

            <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
              <img
                src={EDITORIAL_PHOTOS.forestTrail.src}
                alt={EDITORIAL_PHOTOS.forestTrail.alt}
                width={640}
                height={480}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-serif text-lg font-medium">À cette période de l&apos;année</p>
                <p className="text-xs text-white/80 mt-1">
                  Moments des années passées dans une fenêtre de ±6 jours autour de la date du jour.
                </p>
              </figcaption>
            </figure>

            <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
              <img
                src={EDITORIAL_PHOTOS.alpineLake.src}
                alt={EDITORIAL_PHOTOS.alpineLake.alt}
                width={640}
                height={480}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-serif text-lg font-medium">Escapades &amp; Coups de cœur oubliés</p>
                <p className="text-xs text-white/80 mt-1">
                  Regroupements par lieu renseigné (4 photos min.) et favoris anciens de plus de 6 mois.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* 05 / F. Retouchez sans détruire + G. Géolocalisation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-6 border-t border-neutral-200 items-start">
          {/* Comparateur interactif Avant / Après */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 aspect-[4/3] bg-neutral-900 select-none">
              {/* Image Retouchée (arrière-plan) */}
              <img
                src={EDITORIAL_PHOTOS.alpineLake.src}
                alt="Aperçu démonstration de filtre appliqué sans modifier l'original"
                width={800}
                height={600}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{ filter: activePreset.filterCss }}
                className="w-full h-full object-cover"
              />

              {/* Image Originale superposée selon sliderPosition */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={EDITORIAL_PHOTOS.alpineLake.src}
                  alt="Image originale intacte avant retouche"
                  width={800}
                  height={600}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ligne de séparation */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 w-0.5 bg-white shadow"
                style={{ left: `${sliderPosition}%` }}
              />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 text-white text-[11px] font-medium">
                Original intact
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/70 text-white text-[11px] font-medium">
                Prévisualisation ({activePreset.label})
              </div>
            </div>

            {/* Contrôles interactifs de démonstration */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Préréglages de filtre">
                {EDITOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      selectedPreset === preset.id
                        ? 'bg-[#18191D] text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-3 text-xs font-medium text-neutral-700 shrink-0">
                <span>Comparer</span>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  aria-label="Curseur de comparaison avant/après"
                  className="w-28 sm:w-36 accent-[#1E35D0]"
                />
              </label>
            </div>
          </div>

          {/* F. Retouche + G. Géolocalisation */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">
                05. Édition non destructive
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D]">
                Retouchez sans détruire
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Vos réglages (luminosité, contraste, saturation, exposition, température, teinte, vignettage,
                filtres créatifs, rotation par 90°, recadrage libre ou par ratios) sont enregistrés en JSON dans
                les métadonnées. Le fichier original stocké dans IndexedDB reste intouché.
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Précision technique : les curseurs hautes lumières et ombres sont mémorisés sans shader dédié à
                l&apos;export Canvas, et la teinte CSS n&apos;est pas encore reportée dans l&apos;export JPEG
                (<code className="font-mono">exportService.ts</code>).
              </p>
            </div>

            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">
                06. Géolocalisation EXIF
              </span>
              <h4 className="font-landing text-xl font-bold text-[#18191D]">
                Vos voyages situés sur carte interactive
              </h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Lorsqu&apos;une photo contient des coordonnées GPS EXIF, elle est placée automatiquement sur la carte
                Leaflet (<code className="font-mono text-xs">MapComponent.tsx</code>) avec accès direct à la fiche
                du cliché.
              </p>
              <p className="text-xs text-neutral-500">
                Note réseau : l&apos;affichage des fonds cartographiques OpenStreetMap nécessite une connexion
                Internet ; hors ligne, un bandeau informatif s&apos;affiche proprement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
