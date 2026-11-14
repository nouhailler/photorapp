import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { parseNaturalLanguageQuery } from '../../services/naturalSearchService';
import { DEMO_PHOTOS } from './landingMedia';

const SAMPLE_QUERIES = [
  'Montagnes en hiver',
  'Photos de plage avec GPS',
  'Coups de cœur 2024 à Paris',
  'Photos floues',
];

const MONTH_NAMES_FR = [
  '',
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export const DemoSearch: React.FC = () => {
  const [queryInput, setQueryInput] = useState<string>(SAMPLE_QUERIES[0]);

  const parsedResult = useMemo(() => parseNaturalLanguageQuery(queryInput), [queryInput]);

  // Explication pédagogique claire en français de ce que le parseur réel a détecté
  const explanationParts = useMemo(() => {
    const parts: string[] = [];
    const { extractedFilters, semanticTags, inferredSeason, inferredCategory } = parsedResult;

    if (extractedFilters.isFavorite) {
      parts.push('filtre « Favoris » activé');
    }
    if (extractedFilters.hasGps) {
      parts.push('filtre « Avec coordonnées GPS » activé');
    }
    if (extractedFilters.isBlurry) {
      parts.push('filtre « Clichés flous » activé');
    }
    if (extractedFilters.year) {
      parts.push(`année ciblée : ${extractedFilters.year}`);
    }
    if (inferredSeason && extractedFilters.month) {
      parts.push(
        `saison « ${inferredSeason} » ramenée au mois central (${MONTH_NAMES_FR[extractedFilters.month]}, mois ${extractedFilters.month})`
      );
    }
    if (inferredCategory && semanticTags.length > 0) {
      parts.push(`concept lexical « ${inferredCategory} » étendu à ${semanticTags.length} synonymes`);
    }
    if (extractedFilters.query) {
      parts.push(`mots-clés texte résiduels : « ${extractedFilters.query} »`);
    }

    return parts;
  }, [parsedResult]);

  // Correspondance illustrative en mémoire sur les 8 clichés de démonstration uniquement
  const matchingDemoPhotos = useMemo(() => {
    const clean = queryInput.trim();
    if (!clean) return [];
    const { extractedFilters, semanticTags } = parsedResult;

    return DEMO_PHOTOS.filter((photo) => {
      if (extractedFilters.isFavorite && !photo.isFavorite) return false;
      if (extractedFilters.hasGps && !photo.hasGps) return false;
      if (extractedFilters.isBlurry) return false; // Les 8 clichés de démo sont nets
      if (extractedFilters.year && !photo.dateLabel.includes(String(extractedFilters.year))) return false;

      if (extractedFilters.month) {
        const monthWord = MONTH_NAMES_FR[extractedFilters.month];
        const seasonMonthOk =
          photo.dateLabel.toLowerCase().includes(monthWord) ||
          (parsedResult.inferredSeason ? photo.tags.includes(parsedResult.inferredSeason) : false);
        if (!seasonMonthOk) return false;
      }

      if (semanticTags.length > 0) {
        const haystack = `${photo.title} ${photo.location} ${photo.tags.join(' ')}`.toLowerCase();
        const matchesConcept = semanticTags.some((tag) => haystack.includes(tag.toLowerCase()));
        if (!matchesConcept) return false;
      }

      if (extractedFilters.query) {
        const terms = extractedFilters.query.toLowerCase().split(/\s+/).filter(Boolean);
        const haystack = `${photo.title} ${photo.location} ${photo.tags.join(' ')} ${photo.camera}`.toLowerCase();
        const matchesQuery = terms.every((term) => haystack.includes(term));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [queryInput, parsedResult]);

  return (
    <div id="demo-recherche" className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="font-mono text-xs font-semibold text-[#1E35D0]">
            02. Recherche par intentions · Parseur réel local
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D]">
            Saisissez une requête et observez comment Gallery Pro la décompose
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Ce champ appelle directement <code className="font-mono text-xs">parseNaturalLanguageQuery()</code> depuis
            le code de l&apos;application (<code className="font-mono text-xs">naturalSearchService.ts</code>). Il
            fonctionne par règles lexicales locales et un dictionnaire de 17 concepts synonymes — sans serveur, sans LLM
            et sans recherche vectorielle.
          </p>
        </div>

        <Link
          to="/search"
          className="text-xs font-semibold text-[#1E35D0] hover:underline whitespace-nowrap shrink-0 self-start lg:self-end"
        >
          Ouvrir la recherche complète →
        </Link>
      </div>

      {/* Champ de saisie libre + boutons d'exemples rapides */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <label htmlFor="demo-search-input" className="sr-only">
            Saisir une requête de recherche de démonstration
          </label>
          <div className="relative flex-grow">
            <span
              className="material-symbols-outlined text-[20px] text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            >
              search
            </span>
            <input
              id="demo-search-input"
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ex. : Montagnes en hiver, Photos de plage avec GPS, Lyon..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-[#FAF9F6] text-[#18191D] rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1E35D0] focus:border-[#1E35D0]"
            />
          </div>
          {queryInput && (
            <button
              type="button"
              onClick={() => setQueryInput('')}
              className="px-4 py-3 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Exemples de requêtes de recherche">
          <span className="text-xs font-medium text-neutral-500 mr-1">Essayer :</span>
          {SAMPLE_QUERIES.map((q) => {
            const active = queryInput.trim().toLowerCase() === q.toLowerCase();
            return (
              <button
                key={q}
                type="button"
                onClick={() => setQueryInput(q)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] ${
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
      </div>

      {/* Résultat pédagogique + filtres extraits + aperçu sur les 8 photos de démo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-[#F2F1EC] rounded-xl p-5 space-y-4">
          {/* Explication en français clair */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#18191D]">Interprétation pédagogique :</div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {queryInput.trim() === ''
                ? 'Saisissez un mot-clé, une année (ex. 2024), une saison (hiver, été…) ou un critère (favori, GPS, flou).'
                : explanationParts.length > 0
                  ? explanationParts.join(' · ') + '.'
                  : 'Aucun critère lexical spécifique détecté ; recherche textuelle simple appliquée.'}
            </p>
          </div>

          {/* Filtres structurés extraits par parseNaturalLanguageQuery */}
          <div className="border-t border-neutral-300/70 pt-3 font-mono text-xs space-y-2 text-neutral-800">
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
              <div className="pt-1 border-t border-neutral-300/60">
                <span className="text-neutral-500">Synonymes sémantiques :</span>{' '}
                <span className="text-[#1E35D0] font-medium">{parsedResult.semanticTags.join(' · ')}</span>
              </div>
            )}
            {parsedResult.extractedFilters.query && (
              <div>
                <span className="text-neutral-500">Mots-clés texte résiduels :</span>{' '}
                <span className="font-semibold">{parsedResult.extractedFilters.query}</span>
              </div>
            )}
          </div>
        </div>

        {/* Aperçu des correspondances sur les 8 clichés de démonstration uniquement */}
        <div className="lg:col-span-5 bg-[#FAF9F6] rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#18191D]">Aperçu sur le jeu de démonstration</span>
            <span className="font-mono text-neutral-500 tabular-nums">
              {matchingDemoPhotos.length} / {DEMO_PHOTOS.length}
            </span>
          </div>

          {matchingDemoPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {matchingDemoPhotos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="rounded-lg overflow-hidden border border-neutral-200 bg-white">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={320}
                    height={240}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-[#18191D] truncate">{photo.title}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{photo.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600 leading-relaxed py-3">
              {parsedResult.extractedFilters.isBlurry
                ? 'Les 8 photographies de démonstration sont nettes ; dans votre bibliothèque réelle, ce filtre isole les clichés dont la variance du Laplacien est inférieure à 120.'
                : 'Aucun des 8 clichés de démonstration ne correspond exactement à ces filtres combinés.'}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Limites documentées : une saison cible son mois central (ex. mois 1 pour l&apos;hiver), et les attributs hors
        dictionnaire (comme les couleurs) sont traités comme recherche textuelle simple. Cette démonstration porte
        uniquement sur les exemples affichés ici.
      </p>
    </div>
  );
};
