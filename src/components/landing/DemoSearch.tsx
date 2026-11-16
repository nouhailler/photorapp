import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { parseNaturalLanguageQuery } from '../../services/naturalSearchService';
import { DEMO_PHOTOS } from './landingMedia';
import { useLandingLang, type LandingLang } from './LandingLangContext';

const SAMPLE_QUERIES = {
  fr: ['Montagnes en hiver', 'Photos de plage avec GPS', 'Coups de cœur 2024 à Paris', 'Photos floues'],
  en: ['Winter 2024 with GPS', 'Favorite photos 2024 Paris', 'Plage with GPS', 'Photos floues'],
} as const;

const MONTH_NAMES = {
  fr: ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
} as const;

const COPY = {
  fr: {
    tag: '02. Recherche par intentions · Parseur réel local',
    heading: 'Saisissez une requête et observez comment Gallery Pro la décompose',
    body: (
      <>
        Ce champ appelle directement <code className="font-mono text-xs">parseNaturalLanguageQuery()</code> depuis le
        code de l&apos;application (<code className="font-mono text-xs">naturalSearchService.ts</code>). Il fonctionne
        par règles lexicales locales et un dictionnaire de 17 concepts synonymes — sans serveur, sans LLM et sans
        recherche vectorielle.
      </>
    ),
    openSearch: 'Ouvrir la recherche complète →',
    inputLabel: 'Saisir une requête de recherche de démonstration',
    placeholder: 'Ex. : Montagnes en hiver, Photos de plage avec GPS, Lyon...',
    clear: 'Effacer',
    samplesAria: 'Exemples de requêtes de recherche',
    tryLabel: 'Essayer :',
    explanationTitle: 'Interprétation pédagogique :',
    emptyPrompt: 'Saisissez un mot-clé, une année (ex. 2024), une saison (hiver, été…) ou un critère (favori, GPS, flou).',
    fallbackPrompt: 'Aucun critère lexical spécifique détecté ; recherche textuelle simple appliquée.',
    extractedHeading: 'Filtres structurés extraits localement :',
    favTrue: 'true (Favoris)',
    gpsTrue: 'true (Avec GPS)',
    blurryTrue: 'true (Flou détecté)',
    periodLabel: 'Période :',
    yearPrefix: 'année',
    monthPrefix: 'mois',
    synonymsLabel: 'Synonymes sémantiques :',
    residualLabel: 'Mots-clés texte résiduels :',
    demoMatchesTitle: 'Aperçu sur le jeu de démonstration',
    blurryEmptyNote:
      'Les 8 photographies de démonstration sont nettes ; dans votre bibliothèque réelle, ce filtre isole les clichés dont la variance du Laplacien est inférieure à 120.',
    noMatchNote: 'Aucun des 8 clichés de démonstration ne correspond exactement à ces filtres combinés.',
    disclaimer:
      "Limites documentées : une saison cible son mois central (ex. mois 1 pour l'hiver), et les attributs hors dictionnaire (comme les couleurs) sont traités comme recherche textuelle simple. Cette démonstration porte uniquement sur les exemples affichés ici.",
  },
  en: {
    tag: '02. Intent-Based Search · Real Local Parser',
    heading: 'Type a query and see how Gallery Pro breaks it down locally',
    body: (
      <>
        This input calls <code className="font-mono text-xs">parseNaturalLanguageQuery()</code> directly from the
        application codebase (<code className="font-mono text-xs">naturalSearchService.ts</code>). It relies on local
        lexical rules and a 17-concept synonym dictionary — with zero server calls, zero LLMs, and zero vector search.
      </>
    ),
    openSearch: 'Open full search view →',
    inputLabel: 'Enter a demo search query',
    placeholder: 'E.g., Winter 2024 with GPS, Favorite photos 2024 Paris, Lyon...',
    clear: 'Clear',
    samplesAria: 'Sample search queries',
    tryLabel: 'Try:',
    explanationTitle: 'Plain-language breakdown:',
    emptyPrompt: 'Type a keyword, a year (e.g. 2024), a season (winter, summer…), or a filter (favorite, GPS).',
    fallbackPrompt: 'No structured rule matched; falling back to plain text keyword search.',
    extractedHeading: 'Structured filters extracted locally:',
    favTrue: 'true (Favorites)',
    gpsTrue: 'true (With GPS)',
    blurryTrue: 'true (Blurry flagged)',
    periodLabel: 'Period:',
    yearPrefix: 'year',
    monthPrefix: 'month',
    synonymsLabel: 'Semantic synonyms:',
    residualLabel: 'Residual text keywords:',
    demoMatchesTitle: 'Matches in the demo sample set',
    blurryEmptyNote:
      'All 8 demo photos are sharp; in your live library, this filter isolates shots whose Laplacian variance is below 120.',
    noMatchNote: 'None of the 8 demo photos match all of these combined filters.',
    disclaimer:
      'Documented behavior: seasons map to their central month (e.g. month 1 for winter), the 17 scene root concepts use French dictionary stems while seasons/favorites/GPS/years also match English words, and out-of-dictionary terms fall back to plain text matching.',
  },
} as const;

export const DemoSearch: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];
  const samples = SAMPLE_QUERIES[lang];
  const [customQuery, setCustomQuery] = useState<{ lang: LandingLang; value: string } | null>(null);
  const queryInput = customQuery && customQuery.lang === lang ? customQuery.value : samples[0];
  const setQueryInput = (value: string) => setCustomQuery({ lang, value });

  const parsedResult = useMemo(() => parseNaturalLanguageQuery(queryInput), [queryInput]);

  const explanationParts = useMemo(() => {
    const parts: string[] = [];
    const { extractedFilters, semanticTags, inferredSeason, inferredCategory } = parsedResult;
    const months = MONTH_NAMES[lang];

    if (extractedFilters.isFavorite) {
      parts.push(lang === 'en' ? '« Favorites » filter enabled' : 'filtre « Favoris » activé');
    }
    if (extractedFilters.hasGps) {
      parts.push(lang === 'en' ? '« With GPS coordinates » filter enabled' : 'filtre « Avec coordonnées GPS » activé');
    }
    if (extractedFilters.isBlurry) {
      parts.push(lang === 'en' ? '« Blurry shots » filter enabled' : 'filtre « Clichés flous » activé');
    }
    if (extractedFilters.year) {
      parts.push(lang === 'en' ? `target year: ${extractedFilters.year}` : `année ciblée : ${extractedFilters.year}`);
    }
    if (inferredSeason && extractedFilters.month) {
      parts.push(
        lang === 'en'
          ? `season « ${inferredSeason} » mapped to central month (${months[extractedFilters.month]}, month ${extractedFilters.month})`
          : `saison « ${inferredSeason} » ramenée au mois central (${months[extractedFilters.month]}, mois ${extractedFilters.month})`
      );
    }
    if (inferredCategory && semanticTags.length > 0) {
      parts.push(
        lang === 'en'
          ? `lexical concept « ${inferredCategory} » expanded to ${semanticTags.length} synonyms`
          : `concept lexical « ${inferredCategory} » étendu à ${semanticTags.length} synonymes`
      );
    }
    if (extractedFilters.query) {
      parts.push(
        lang === 'en'
          ? `residual text keywords: « ${extractedFilters.query} »`
          : `mots-clés texte résiduels : « ${extractedFilters.query} »`
      );
    }

    return parts;
  }, [parsedResult, lang]);

  const matchingDemoPhotos = useMemo(() => {
    const clean = queryInput.trim();
    if (!clean) return [];
    const { extractedFilters, semanticTags } = parsedResult;

    return DEMO_PHOTOS.filter((photo) => {
      if (extractedFilters.isFavorite && !photo.isFavorite) return false;
      if (extractedFilters.hasGps && !photo.hasGps) return false;
      if (extractedFilters.isBlurry) return false;
      if (extractedFilters.year && !photo.dateLabel.includes(String(extractedFilters.year))) return false;

      if (extractedFilters.month) {
        const monthWordFr = MONTH_NAMES.fr[extractedFilters.month];
        const seasonMonthOk =
          photo.dateLabel.toLowerCase().includes(monthWordFr) ||
          (parsedResult.inferredSeason ? photo.tags.includes(parsedResult.inferredSeason) : false);
        if (!seasonMonthOk) return false;
      }

      if (semanticTags.length > 0) {
        const haystack = `${photo.title} ${photo.titleEn} ${photo.location} ${photo.tags.join(' ')} ${photo.tagsEn.join(' ')}`.toLowerCase();
        const matchesConcept = semanticTags.some((tag) => haystack.includes(tag.toLowerCase()));
        if (!matchesConcept) return false;
      }

      if (extractedFilters.query) {
        const terms = extractedFilters.query.toLowerCase().split(/\s+/).filter(Boolean);
        const haystack = `${photo.title} ${photo.titleEn} ${photo.location} ${photo.locationEn} ${photo.tags.join(' ')} ${photo.tagsEn.join(' ')} ${photo.camera}`.toLowerCase();
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
          <span className="font-mono text-xs font-semibold text-[#1E35D0]">{t.tag}</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D]">{t.heading}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">{t.body}</p>
        </div>

        <Link
          to="/search"
          className="text-xs font-semibold text-[#1E35D0] hover:underline whitespace-nowrap shrink-0 self-start lg:self-end"
        >
          {t.openSearch}
        </Link>
      </div>

      {/* Live text input + quick sample chips */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <label htmlFor="demo-search-input" className="sr-only">
            {t.inputLabel}
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
              placeholder={t.placeholder}
              className="w-full pl-11 pr-4 py-3 text-sm bg-[#FAF9F6] text-[#18191D] rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1E35D0] focus:border-[#1E35D0]"
            />
          </div>
          {queryInput && (
            <button
              type="button"
              onClick={() => setQueryInput('')}
              className="px-4 py-3 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              {t.clear}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.samplesAria}>
          <span className="text-xs font-medium text-neutral-500 mr-1">{t.tryLabel}</span>
          {samples.map((q) => {
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
                {lang === 'en' ? `"${q}"` : `« ${q} »`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pedagogical summary + structured filters + sample preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-[#F2F1EC] rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#18191D]">{t.explanationTitle}</div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {queryInput.trim() === ''
                ? t.emptyPrompt
                : explanationParts.length > 0
                  ? explanationParts.join(' · ') + '.'
                  : t.fallbackPrompt}
            </p>
          </div>

          <div className="border-t border-neutral-300/70 pt-3 font-mono text-xs space-y-2 text-neutral-800">
            <div className="text-neutral-500">{t.extractedHeading}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-neutral-500">isFavorite :</span>{' '}
                <span className="font-semibold">{parsedResult.extractedFilters.isFavorite ? t.favTrue : '—'}</span>
              </div>
              <div>
                <span className="text-neutral-500">hasGps :</span>{' '}
                <span className="font-semibold">{parsedResult.extractedFilters.hasGps ? t.gpsTrue : '—'}</span>
              </div>
              <div>
                <span className="text-neutral-500">isBlurry :</span>{' '}
                <span className="font-semibold">{parsedResult.extractedFilters.isBlurry ? t.blurryTrue : '—'}</span>
              </div>
              <div>
                <span className="text-neutral-500">{t.periodLabel}</span>{' '}
                <span className="font-semibold tabular-nums">
                  {[
                    parsedResult.extractedFilters.year ? `${t.yearPrefix} ${parsedResult.extractedFilters.year}` : null,
                    parsedResult.extractedFilters.month
                      ? `${t.monthPrefix} ${parsedResult.extractedFilters.month}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </span>
              </div>
            </div>
            {parsedResult.semanticTags.length > 0 && (
              <div className="pt-1 border-t border-neutral-300/60">
                <span className="text-neutral-500">{t.synonymsLabel}</span>{' '}
                <span className="text-[#1E35D0] font-medium">{parsedResult.semanticTags.join(' · ')}</span>
              </div>
            )}
            {parsedResult.extractedFilters.query && (
              <div>
                <span className="text-neutral-500">{t.residualLabel}</span>{' '}
                <span className="font-semibold">{parsedResult.extractedFilters.query}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#FAF9F6] rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#18191D]">{t.demoMatchesTitle}</span>
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
                    alt={lang === 'en' ? photo.altEn : photo.alt}
                    width={320}
                    height={240}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-[#18191D] truncate">
                      {lang === 'en' ? photo.titleEn : photo.title}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      {lang === 'en' ? photo.locationEn : photo.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600 leading-relaxed py-3">
              {parsedResult.extractedFilters.isBlurry ? t.blurryEmptyNote : t.noMatchNote}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">{t.disclaimer}</p>
    </div>
  );
};
