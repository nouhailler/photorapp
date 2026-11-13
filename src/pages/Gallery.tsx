import React, { useState, useMemo } from 'react';
import PhotoGrid from '../components/PhotoGrid';
import DetailView from '../components/DetailView';
import Editor from '../components/Editor';
import { usePhotos } from '../context/usePhotos';
import { exportPhotosToZip } from '../services/exportService';
import { SlideshowModal } from '../components/SlideshowModal';
import { HelpTooltip } from '../components/HelpTooltip';
import { SouvenirsCarousel } from '../components/SouvenirsCarousel';
import type { Photo, PhotoSouvenir } from '../types/types';


const Gallery: React.FC = () => {
  const { photos, albums, toggleFavorite, deletePhotos, addPhotosToAlbum, createAlbum } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'gps'>('all');
  const [activeSouvenir, setActiveSouvenir] = useState<PhotoSouvenir | null>(null);

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Slideshow State
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);

  const filteredPhotos = useMemo(() => {
    let result = activeSouvenir ? activeSouvenir.photos : photos;

    if (filterMode === 'favorites') {
      result = result.filter((p) => p.isFavorite);
    } else if (filterMode === 'gps') {
      result = result.filter((p) => typeof p.metadata?.latitude === 'number');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.alt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.metadata?.location?.toLowerCase().includes(q) ||
          p.metadata?.device?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [photos, activeSouvenir, filterMode, searchQuery]);


  // Grouping by Date (Day / Month)
  const groupedPhotos = useMemo(() => {
    return filteredPhotos.reduce((acc, photo) => {
      const date = photo.date || 'Date inconnue';
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
  }, [filteredPhotos]);

  // Selection Handlers
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedPhotoIds([]);
    }
    setIsSelectionMode(!isSelectionMode);
  };

  const handleTogglePhotoSelection = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectGroup = (datePhotos: Photo[]) => {
    const dateIds = datePhotos.map((p) => p.id);
    const allInGroupSelected = dateIds.every((id) => selectedPhotoIds.includes(id));

    if (allInGroupSelected) {
      setSelectedPhotoIds((prev) => prev.filter((id) => !dateIds.includes(id)));
    } else {
      setSelectedPhotoIds((prev) => {
        const newIds = [...prev];
        dateIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
    if (!isSelectionMode) setIsSelectionMode(true);
  };

  const handleDeleteConfirmed = async () => {
    await deletePhotos(selectedPhotoIds);
    setSelectedPhotoIds([]);
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
  };

  const handleSelectAll = () => {
    const allIds = filteredPhotos.map((p) => p.id);
    if (selectedPhotoIds.length === allIds.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(allIds);
    }
  };

  const handleExportSelectedZip = async () => {
    const selected = photos.filter((p) => selectedPhotoIds.includes(p.id));
    if (selected.length === 0) return;
    setIsExportingZip(true);
    try {
      await exportPhotosToZip(selected, `selection_${selected.length}_photos.zip`);
      setIsSelectionMode(false);
      setSelectedPhotoIds([]);
    } catch (e) {
      console.error('Export zip failed:', e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleAddSelectedToAlbum = (albumId: string) => {
    addPhotosToAlbum(selectedPhotoIds, albumId);
    setShowAlbumPicker(false);
    setIsSelectionMode(false);
    setSelectedPhotoIds([]);
  };

  return (
    <div className="space-y-section-margin relative min-h-screen pb-32 max-w-6xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="px-container-padding space-y-3 pt-2">
        <div className="flex gap-2 items-center">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="w-full h-12 bg-surface-container-low border border-outline-variant/30 rounded-2xl pl-12 pr-4 font-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary outline-none transition-all shadow-sm"
              placeholder="Rechercher par nom, tag, lieu, appareil..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Diaporama Button */}
          {filteredPhotos.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSlideshowOpen(true)}
                className="h-12 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-label-md flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                title="Lancer le diaporama plein écran"
              >
                <span className="material-symbols-outlined text-primary text-[22px] material-symbols-fill">
                  slideshow
                </span>
                <span className="hidden sm:inline">Diaporama</span>
              </button>
              <HelpTooltip
                title="Diaporama plein écran"
                text="Lance la lecture automatisée de vos photos avec réglage de vitesse et lecture aléatoire."
              />
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <HelpTooltip
            title="Filtres rapides"
            text="Filtrez en un clic pour afficher toutes les photos, uniquement les clichés favoris ou ceux munis de coordonnées GPS."
          />
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-1.5 rounded-full text-label-sm font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Toutes ({photos.length})
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-sm font-semibold transition-all ${
              filterMode === 'favorites'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] material-symbols-fill">star</span>
            <span>Favoris ({photos.filter((p) => p.isFavorite).length})</span>
          </button>
          <button
            onClick={() => setFilterMode('gps')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-sm font-semibold transition-all ${
              filterMode === 'gps'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>Avec GPS ({photos.filter((p) => typeof p.metadata?.latitude === 'number').length})</span>
          </button>
        </div>
      </div>

      {/* Active Souvenir Focus Banner */}
      {activeSouvenir && (
        <div className="mx-container-padding p-4 bg-gradient-to-r from-primary-container/60 to-tertiary-container/60 rounded-3xl border border-primary/20 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Souvenir • {activeSouvenir.periodLabel}
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  {activeSouvenir.photos.length} photos
                </span>
              </div>
              <h3 className="text-title-md font-bold text-on-surface mt-0.5">
                {activeSouvenir.title}
              </h3>
              <p className="text-[12px] text-on-surface-variant">
                {activeSouvenir.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSlideshowOpen(true)}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] material-symbols-fill">slideshow</span>
              <span>Lancer le diaporama</span>
            </button>
            <button
              onClick={() => setActiveSouvenir(null)}
              className="p-2 rounded-xl bg-surface hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
              title="Fermer ce souvenir et revenir à toute la galerie"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Retrospective Souvenirs Carousel */}
      {!activeSouvenir && !searchQuery.trim() && filterMode === 'all' && (
        <SouvenirsCarousel
          photos={photos}
          onSelectSouvenir={(souvenir) => setActiveSouvenir(souvenir)}
        />
      )}


      {/* Selection Mode Header Banner */}
      {isSelectionMode && (
        <div className="mx-container-padding p-3 flex justify-between items-center bg-primary-container/40 border border-primary/30 rounded-2xl">
          <span className="text-label-md font-bold text-primary">
            {selectedPhotoIds.length} sélectionnée(s) sur {filteredPhotos.length}
          </span>
          <button onClick={handleSelectAll} className="text-label-sm font-bold text-primary hover:underline">
            {selectedPhotoIds.length === filteredPhotos.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>
      )}

      {/* Main Photo Timeline Grid */}
      {Object.entries(groupedPhotos).length > 0 ? (
        Object.entries(groupedPhotos).map(([date, datePhotos], index) => (
          <section key={date} className="space-y-2">
            <div className="px-container-padding flex justify-between items-end">
              <h3 className="text-headline-md font-bold text-on-surface">
                {date === new Date().toISOString().split('T')[0] ? "Aujourd'hui" : date}
              </h3>
              <span
                onClick={() =>
                  isSelectionMode ? toggleSelectionMode() : handleSelectGroup(datePhotos)
                }
                className={`text-label-sm font-bold cursor-pointer hover:underline transition-colors ${
                  isSelectionMode && datePhotos.every((p) => selectedPhotoIds.includes(p.id))
                    ? 'text-primary'
                    : 'text-primary/70'
                }`}
              >
                {isSelectionMode
                  ? datePhotos.every((p) => selectedPhotoIds.includes(p.id))
                    ? 'Désélectionner groupe'
                    : 'Sélectionner groupe'
                  : 'Sélectionner'}
              </span>
            </div>

            <PhotoGrid
              photos={datePhotos}
              onPhotoClick={setSelectedPhoto}
              featured={!searchQuery && index === 0 && !isSelectionMode && filterMode === 'all'}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedPhotoIds}
              onToggleSelection={handleTogglePhotoSelection}
            />
          </section>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-container-padding text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-4xl">photo_library</span>
          </div>
          <p className="text-headline-md font-bold text-on-surface">Aucune photo trouvée</p>
          <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">
            {searchQuery
              ? 'Aucun résultat ne correspond à votre recherche.'
              : 'Importez des photos depuis votre appareil ou l\'onglet Sauvegarde.'}
          </p>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-surface-container-highest/95 backdrop-blur-2xl border border-outline-variant/40 rounded-full h-16 shadow-2xl z-50 flex items-center justify-around px-6 animate-in slide-in-from-bottom-6">
          <button
            onClick={toggleSelectionMode}
            className="flex flex-col items-center gap-0.5 text-on-surface-variant active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            <span className="text-[10px] font-bold">Annuler</span>
          </button>
          <div className="w-px h-8 bg-outline-variant/40" />

          <button
            disabled={selectedPhotoIds.length === 0 || isExportingZip}
            onClick={handleExportSelectedZip}
            className="flex flex-col items-center gap-0.5 text-primary disabled:opacity-30 active:scale-90 transition-transform"
            title="Télécharger la sélection en archive ZIP"
          >
            <span className="material-symbols-outlined text-[20px]">folder_zip</span>
            <span className="text-[10px] font-bold">Export ZIP</span>
          </button>

          <button
            disabled={selectedPhotoIds.length === 0}
            onClick={() => setShowAlbumPicker(true)}
            className="flex flex-col items-center gap-0.5 text-primary disabled:opacity-30 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
            <span className="text-[10px] font-bold">Album</span>
          </button>

          <button
            disabled={selectedPhotoIds.length === 0}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex flex-col items-center gap-0.5 text-error disabled:opacity-30 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            <span className="text-[10px] font-bold">Supprimer</span>
          </button>
        </div>
      )}

      {/* Add To Album Picker Modal */}
      {showAlbumPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-sm font-bold text-on-surface">Ajouter à l'album</h3>
              <button
                onClick={() => setShowAlbumPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {albums.filter((a) => !a.isSmart).length > 0 ? (
                albums
                  .filter((a) => !a.isSmart)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleAddSelectedToAlbum(a.id)}
                      className="w-full p-3 rounded-xl bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant/20 flex items-center justify-between text-left transition-colors"
                    >
                      <span className="text-label-md font-bold text-on-surface">{a.title}</span>
                      <span className="material-symbols-outlined text-primary text-[18px]">add</span>
                    </button>
                  ))
              ) : (
                <p className="text-body-sm text-on-surface-variant text-center py-4">
                  Aucun album manuel disponible.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                const title = `Album du ${new Date().toLocaleDateString()}`;
                const newAlbum = createAlbum(title);
                handleAddSelectedToAlbum(newAlbum.id);
              }}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
            >
              + Créer un nouvel album avec la sélection
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                Supprimer {selectedPhotoIds.length} photo(s) ?
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Ces photos seront définitivement retirées de votre photothèque locale.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-6 py-2.5 rounded-xl bg-error text-white font-bold text-label-md active:scale-95"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Edit Modals */}
      {selectedPhoto && !isSelectionMode && (
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

      {/* Fullscreen Slideshow Modal */}
      <SlideshowModal
        photos={filteredPhotos}
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
      />
    </div>
  );
};

export default Gallery;
