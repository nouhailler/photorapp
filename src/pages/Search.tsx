import React, { useState, useMemo } from 'react';
import { usePhotos } from '../context/usePhotos';
import PhotoGrid from '../components/PhotoGrid';
import DetailView from '../components/DetailView';
import Editor from '../components/Editor';
import { extractAvailableFilters, smartSearchPhotos } from '../services/searchEngine';
import type { SearchFilters } from '../services/searchEngine';
import { HelpTooltip } from '../components/HelpTooltip';
import { useLanguage } from '../context/useLanguage';
import type { Photo } from '../types/types';

const INFERRED_CATEGORY_EN: Record<string, string> = {
  montagne: 'mountain',
  plage: 'beach',
  coucher: 'sunset',
  chien: 'dog',
  chat: 'cat',
  portrait: 'portrait',
  architecture: 'architecture',
  nuit: 'night',
  nature: 'nature',
  forêt: 'forest',
  ville: 'city',
  mer: 'sea',
  fleur: 'flower',
  voyage: 'travel',
};

const Search: React.FC = () => {
  const { photos, albums, toggleFavorite } = usePhotos();
  const { lang, isEn } = useLanguage();

  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [gpsFilter, setGpsFilter] = useState<'all' | 'withGps' | 'withoutGps'>('all');
  const [onlyBlurry, setOnlyBlurry] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract real dynamic filters from actual library
  const availableFilters = useMemo(() => {
    return extractAvailableFilters(photos, albums, lang);
  }, [photos, albums, lang]);

  // Combined search filters
  const filters: SearchFilters = useMemo(() => {
    let hasGpsValue: boolean | undefined = undefined;
    if (gpsFilter === 'withGps') hasGpsValue = true;
    if (gpsFilter === 'withoutGps') hasGpsValue = false;

    return {
      query: selectedTag ? selectedTag : undefined,
      year: selectedYear,
      month: selectedMonth,
      albumId: selectedAlbumId,
      location: selectedLocation,
      device: selectedDevice,
      isFavorite: onlyFavorites ? true : undefined,
      hasGps: hasGpsValue,
      isBlurry: onlyBlurry ? true : undefined,
      dateRange: dateStart || dateEnd ? { start: dateStart, end: dateEnd } : undefined,
    };
  }, [
    selectedTag,
    selectedYear,
    selectedMonth,
    selectedAlbumId,
    selectedLocation,
    selectedDevice,
    onlyFavorites,
    gpsFilter,
    onlyBlurry,
    dateStart,
    dateEnd,
  ]);

  // Intelligent Search Outcome (natural language + metadata)
  const searchOutcome = useMemo(() => {
    return smartSearchPhotos(photos, query, filters, albums);
  }, [photos, query, filters, albums]);

  const searchResults = searchOutcome.results;


  const hasActiveFilters = Boolean(
    query ||
      selectedYear !== undefined ||
      selectedMonth !== undefined ||
      selectedAlbumId ||
      selectedLocation ||
      selectedTag ||
      selectedDevice ||
      onlyFavorites ||
      gpsFilter !== 'all' ||
      onlyBlurry ||
      dateStart ||
      dateEnd
  );

  const handleResetFilters = () => {
    setQuery('');
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setSelectedAlbumId(undefined);
    setSelectedLocation(undefined);
    setSelectedTag(undefined);
    setSelectedDevice(undefined);
    setOnlyFavorites(false);
    setGpsFilter('all');
    setOnlyBlurry(false);
    setDateStart('');
    setDateEnd('');
  };

  return (
    <div className="px-container-padding space-y-section-margin max-w-6xl mx-auto pb-28">
      {/* Header */}
      <section className="pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-lg font-bold text-on-surface">
            {isEn ? 'Advanced Search & Filters' : 'Recherche Avancée & Filtres'}
          </h2>
          <HelpTooltip
            title={isEn ? 'Search & Filters' : 'Recherche & Filtres'}
            text={
              isEn
                ? 'Instantly filter your shots by keyword, tags, favorite status, GPS coordinates, month, and image quality with zero network calls.'
                : "Filtrez instantanément vos clichés par mot-clé, tags, statut favori, coordonnées GPS, mois et qualité d'image sans appel réseau."
            }
          />
        </div>
        <p className="text-body-sm text-on-surface-variant mt-1">
          {isEn
            ? 'Explore your local photo library with instant, combinable precision filters.'
            : 'Explorez votre photothèque locale avec des filtres combinables précis et instantanés.'}
        </p>
      </section>

      {/* Search Bar */}
      <div className="relative">
        <div className="group relative flex items-center bg-surface-container-low rounded-2xl p-1.5 shadow-sm border border-outline-variant/30 focus-within:border-primary transition-all">
          <div className="pl-3.5 pr-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[22px]">search</span>
          </div>
          <input
            data-demo-id="search-input"
            className="bg-transparent border-none focus:ring-0 w-full py-2.5 font-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none"
            placeholder={
              isEn
                ? 'Search by keyword, tag, location, camera, metadata...'
                : 'Rechercher par mot-clé, tag, lieu, appareil, métadonnée...'
            }
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <HelpTooltip
            className="mr-2"
            title={isEn ? 'Accepted keywords' : 'Mots-clés acceptés'}
            text={
              isEn
                ? 'Search a photo title, camera name (e.g. Sony, iPhone), city name, or assigned tag.'
                : "Recherchez un titre, un nom d'appareil (ex: Sony, iPhone), un nom de ville ou un tag associé."
            }
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-2 mr-1 rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Natural Language Semantic Badges */}
        {(searchOutcome.inferredCategory || searchOutcome.semanticTags.length > 0) && (
          <div data-demo-id="search-semantic-badges" className="flex items-center gap-2 pt-2.5 px-2 flex-wrap text-label-xs animate-in fade-in">
            <span className="text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">psychology</span>
              {isEn ? 'Natural language analysis:' : 'Analyse du langage naturel :'}
            </span>
            {searchOutcome.inferredCategory && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-semibold">
                {isEn ? 'Scene:' : 'Scène :'}{' '}
                {isEn
                  ? INFERRED_CATEGORY_EN[searchOutcome.inferredCategory.toLowerCase()] ||
                    searchOutcome.inferredCategory
                  : searchOutcome.inferredCategory}
              </span>
            )}
            {searchOutcome.semanticTags.map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Query Suggestions for novices */}
        {!query && (
          <div className="flex items-center gap-1.5 pt-2 px-1 flex-wrap">
            <span className="text-[11px] text-on-surface-variant/80 font-medium">
              {isEn ? 'Examples:' : 'Exemples :'}
            </span>
            {(isEn
              ? [
                  'Mountains in winter',
                  'Dogs in a garden',
                  'Sunset',
                  'Recent portraits',
                  'Photos with GPS',
                ]
              : [
                  'Montagnes en hiver',
                  'Chiens dans un jardin',
                  'Coucher de soleil',
                  'Portraits récents',
                  'Photos avec GPS',
                ]
            ).map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-2.5 py-0.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-[11px] text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/20"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Quick Filter Chips Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
              {isEn ? 'Instant filters' : 'Filtres instantanés'}
            </span>
            <button
              data-demo-id="search-more-filters-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-primary text-label-xs font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showAdvancedFilters ? 'expand_less' : 'tune'}
              </span>
              <span>
                {showAdvancedFilters
                  ? isEn ? 'Hide advanced filters' : 'Masquer filtres avancés'
                  : isEn ? 'More filters' : 'Plus de filtres'}
              </span>
            </button>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-label-xs font-bold text-primary hover:underline"
            >
              {isEn ? 'Reset all' : 'Tout réinitialiser'}
            </button>
          )}
        </div>

        {/* Primary Filter Row */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {/* Favorites toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-label-sm font-semibold whitespace-nowrap transition-all ${
              onlyFavorites
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] material-symbols-fill">star</span>
            <span>{isEn ? 'Favorites' : 'Favoris'}</span>
          </button>

          {/* GPS Filter Cycle */}
          <button
            onClick={() => {
              if (gpsFilter === 'all') setGpsFilter('withGps');
              else if (gpsFilter === 'withGps') setGpsFilter('withoutGps');
              else setGpsFilter('all');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-label-sm font-semibold whitespace-nowrap transition-all ${
              gpsFilter !== 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {gpsFilter === 'withoutGps' ? 'location_off' : 'location_on'}
            </span>
            <span>
              {gpsFilter === 'all' && (isEn ? 'GPS (All)' : 'GPS (Tous)')}
              {gpsFilter === 'withGps' && (isEn ? 'With GPS' : 'Avec GPS')}
              {gpsFilter === 'withoutGps' && (isEn ? 'Without GPS' : 'Sans GPS')}
            </span>
          </button>

          {/* Blurry Filter Toggle */}
          <button
            onClick={() => setOnlyBlurry(!onlyBlurry)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-label-sm font-semibold whitespace-nowrap transition-all ${
              onlyBlurry
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">blur_on</span>
            <span>{isEn ? 'Blurry photos' : 'Photos floues'}</span>
          </button>

          {/* Real Years */}
          {availableFilters.years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(selectedYear === year ? undefined : year)}
              className={`px-4 py-2 rounded-full text-label-sm font-semibold whitespace-nowrap transition-all ${
                selectedYear === year
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div data-demo-id="search-advanced-drawer" className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Month selector */}
              <div>
                <label className="block text-label-xs font-bold text-on-surface mb-1">
                  {isEn ? 'Month' : 'Mois'}
                </label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) =>
                    setSelectedMonth(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  className="w-full h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                >
                  <option value="">{isEn ? 'All months' : 'Tous les mois'}</option>
                  {availableFilters.months.map((m) => (
                    <option key={m.number} value={m.number}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Album selector */}
              <div>
                <label className="block text-label-xs font-bold text-on-surface mb-1">Album</label>
                <select
                  value={selectedAlbumId || ''}
                  onChange={(e) => setSelectedAlbumId(e.target.value || undefined)}
                  className="w-full h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                >
                  <option value="">{isEn ? 'All albums' : 'Tous les albums'}</option>
                  {availableFilters.albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera / Device selector */}
              <div>
                <label className="block text-label-xs font-bold text-on-surface mb-1">
                  {isEn ? 'Camera' : 'Appareil'}
                </label>
                <select
                  value={selectedDevice || ''}
                  onChange={(e) => setSelectedDevice(e.target.value || undefined)}
                  className="w-full h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                >
                  <option value="">{isEn ? 'All cameras' : 'Tous les appareils'}</option>
                  {availableFilters.devices.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            <div>
              <label className="block text-label-xs font-bold text-on-surface mb-1">
                {isEn ? 'Custom date range (start / end)' : 'Période personnalisée (début / fin)'}
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                />
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Real Locations Row (if any) */}
        {availableFilters.locations.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 text-label-xs">
            <span className="text-on-surface-variant font-semibold flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
              {isEn ? 'Locations:' : 'Lieux :'}
            </span>
            {availableFilters.locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(selectedLocation === loc ? undefined : loc)}
                className={`px-3 py-1 rounded-lg text-label-xs font-medium whitespace-nowrap transition-all ${
                  selectedLocation === loc
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        {/* Real Tags Row (if any) */}
        {availableFilters.tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 text-label-xs">
            <span className="text-on-surface-variant font-semibold flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[14px]">label</span>
              Tags :
            </span>
            {availableFilters.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                className={`px-3 py-1 rounded-lg text-label-xs font-medium whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Results Header */}
      <section className="space-y-4">
        <div data-demo-id="search-results-header" className="flex justify-between items-center">
          <h3 className="text-headline-md font-bold text-on-surface">
            {hasActiveFilters
              ? isEn
                ? `${searchResults.length} result(s) found`
                : `${searchResults.length} résultat(s) trouvé(s)`
              : isEn
                ? `All photos (${searchResults.length})`
                : `Toutes les photos (${searchResults.length})`}
          </h3>
          <span className="text-label-sm text-on-surface-variant">
            {isEn ? `${photos.length} total photos` : `${photos.length} photos au total`}
          </span>
        </div>

        {searchResults.length > 0 ? (
          <PhotoGrid photos={searchResults} onPhotoClick={setSelectedPhoto} />
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-outline-variant/50 rounded-3xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-4xl">search_off</span>
            </div>
            <h4 className="text-headline-sm font-bold text-on-surface">
              {isEn ? 'No matching photos' : 'Aucune photo ne correspond'}
            </h4>
            <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">
              {isEn
                ? 'Try modifying your search terms or clearing some active filters.'
                : 'Essayez de modifier vos termes de recherche ou de réinitialiser certains filtres.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
            >
              {isEn ? 'Reset filters' : 'Réinitialiser les filtres'}
            </button>
          </div>
        )}
      </section>

      {/* Detail & Edit Modals */}
      {selectedPhoto && (
        <DetailView
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onEdit={() => setIsEditing(true)}
          onToggleFavorite={() => toggleFavorite(selectedPhoto.id)}
        />
      )}

      {isEditing && selectedPhoto && (
        <Editor photo={selectedPhoto} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
};

export default Search;
