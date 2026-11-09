import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/usePhotos';
import PhotoGrid from '../components/PhotoGrid';
import DetailView from '../components/DetailView';
import Editor from '../components/Editor';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import { exportPhotosToZip } from '../services/exportService';
import type { Photo } from '../types/types';

const SelectablePhotoItem: React.FC<{ photo: Photo; isSelected: boolean; onClick: () => void }> = ({
  photo,
  isSelected,
  onClick,
}) => {
  const url = usePhotoUrl(photo);
  return (
    <div className="relative aspect-square cursor-pointer group rounded-xl overflow-hidden" onClick={onClick}>
      <img src={url} className="w-full h-full object-cover" alt="" />
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all ${
          isSelected ? 'bg-primary/40' : 'bg-black/0 group-hover:bg-black/10'
        }`}
      >
        {isSelected ? (
          <span className="material-symbols-outlined text-white text-3xl material-symbols-fill scale-110 transition-transform">
            check_circle
          </span>
        ) : (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white/80 shadow-md bg-black/20" />
        )}
      </div>
    </div>
  );
};

const AlbumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    albums,
    photos,
    toggleFavorite,
    addPhotosToAlbum,
    removePhotoFromAlbum,
    setAlbumCover,
  } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [selectedForAlbum, setSelectedForAlbum] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Manage selection in album view for bulk actions (remove from album)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedInAlbumIds, setSelectedInAlbumIds] = useState<string[]>([]);

  const album = albums.find((a) => a.id === id);

  // Get photos in album
  const albumPhotos = React.useMemo(() => {
    if (!album) return [];
    if (album.isSmart && album.smartCriteria) {
      const criteria = album.smartCriteria;
      return photos.filter((p) => {
        if (criteria.isFavorite && !p.isFavorite) return false;
        if (criteria.year && parseInt((p.date || '').substring(0, 4), 10) !== criteria.year) return false;
        if (criteria.hasGps && (typeof p.metadata?.latitude !== 'number' || typeof p.metadata?.longitude !== 'number')) return false;
        return true;
      });
    }
    return photos.filter((p) => p.albumIds.includes(album.id));
  }, [album, photos]);

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-container-padding text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">folder_off</span>
        <p className="text-headline-md font-bold text-on-surface">Album introuvable</p>
        <button
          onClick={() => navigate('/albums')}
          className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
        >
          Retour aux albums
        </button>
      </div>
    );
  }

  const handleAddPhotos = () => {
    addPhotosToAlbum(selectedForAlbum, album.id);
    setIsAddingPhotos(false);
    setSelectedForAlbum([]);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedForAlbum((prev) =>
      prev.includes(photoId) ? prev.filter((pid) => pid !== photoId) : [...prev, photoId]
    );
  };

  const handleToggleAlbumPhotoSelection = (photoId: string) => {
    setSelectedInAlbumIds((prev) =>
      prev.includes(photoId) ? prev.filter((pid) => pid !== photoId) : [...prev, photoId]
    );
  };

  const handleRemoveSelectedFromAlbum = () => {
    selectedInAlbumIds.forEach((photoId) => {
      removePhotoFromAlbum(photoId, album.id);
    });
    setSelectedInAlbumIds([]);
    setIsSelectionMode(false);
  };

  const handleExportZip = async () => {
    if (albumPhotos.length === 0) return;
    setIsExporting(true);
    setExportProgress(10);
    try {
      await exportPhotosToZip(
        albumPhotos,
        `${album.title.replace(/[^a-z0-9_-]/gi, '_')}.zip`,
        (pct) => setExportProgress(pct)
      );
    } catch (e) {
      console.error('ZIP Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const availablePhotos = photos.filter((p) => !p.albumIds.includes(album.id));

  return (
    <div className="space-y-section-margin pb-28 max-w-6xl mx-auto">
      {/* Header */}
      <section className="px-container-padding pt-4 space-y-4">
        <button
          onClick={() => navigate('/albums')}
          className="flex items-center gap-1.5 text-primary text-label-md font-bold hover:underline active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Retour aux collections</span>
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-headline-lg font-bold text-on-surface leading-tight">{album.title}</h2>
              {album.isSmart && (
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold uppercase tracking-wider">
                  Intelligent
                </span>
              )}
            </div>
            {album.description && (
              <p className="text-body-sm text-on-surface-variant mt-1">{album.description}</p>
            )}
            <p className="text-label-sm font-semibold text-primary mt-1">
              {albumPhotos.length} {albumPhotos.length > 1 ? 'photos' : 'photo'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {albumPhotos.length > 0 && (
              <>
                <button
                  onClick={handleExportZip}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-high text-on-surface rounded-xl text-label-md font-semibold hover:bg-surface-variant active:scale-95 transition-all shadow-sm"
                  title="Télécharger l'album au format ZIP"
                >
                  <span className="material-symbols-outlined text-[18px]">folder_zip</span>
                  <span>{isExporting ? `${exportProgress}%` : 'Export ZIP'}</span>
                </button>

                {!album.isSmart && (
                  <button
                    onClick={() => {
                      if (isSelectionMode) setSelectedInAlbumIds([]);
                      setIsSelectionMode(!isSelectionMode);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
                      isSelectionMode
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    {isSelectionMode ? 'Terminer sélection' : 'Gérer photos'}
                  </button>
                )}
              </>
            )}

            {!album.isSmart && (
              <button
                onClick={() => setIsAddingPhotos(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-bold shadow-md active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                <span>Ajouter</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bulk action bar for removing photos from album */}
      {isSelectionMode && (
        <div className="mx-container-padding p-3 bg-primary-container/20 border border-primary/30 rounded-2xl flex items-center justify-between">
          <span className="text-label-md font-bold text-primary">
            {selectedInAlbumIds.length} sélectionnée(s)
          </span>
          <div className="flex items-center gap-2">
            {selectedInAlbumIds.length === 1 && (
              <button
                onClick={() => {
                  setAlbumCover(album.id, selectedInAlbumIds[0]);
                  setIsSelectionMode(false);
                  setSelectedInAlbumIds([]);
                }}
                className="px-3 py-1.5 bg-surface-container-high text-on-surface rounded-xl text-label-sm font-semibold hover:bg-surface-variant"
              >
                Définir comme couverture
              </button>
            )}
            <button
              disabled={selectedInAlbumIds.length === 0}
              onClick={handleRemoveSelectedFromAlbum}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-error text-white rounded-xl text-label-sm font-bold disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">folder_delete</span>
              <span>Retirer de l'album</span>
            </button>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <section>
        {albumPhotos.length > 0 ? (
          <PhotoGrid
            photos={albumPhotos}
            onPhotoClick={setSelectedPhoto}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedInAlbumIds}
            onToggleSelection={handleToggleAlbumPhotoSelection}
          />
        ) : (
          <div className="mx-container-padding py-20 text-center border-2 border-dashed border-outline-variant/60 rounded-3xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">photo_library</span>
            </div>
            <p className="text-on-surface font-bold text-headline-sm">Cet album est vide</p>
            <p className="text-on-surface-variant text-body-sm mt-1 max-w-sm">
              {album.isSmart
                ? 'Aucune photo ne correspond actuellement aux critères de cet album intelligent.'
                : 'Commencez par ajouter des souvenirs depuis votre photothèque locale.'}
            </p>
            {!album.isSmart && (
              <button
                onClick={() => setIsAddingPhotos(true)}
                className="mt-6 px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold text-label-md active:scale-95 transition-transform shadow-md"
              >
                Ajouter des photos à l'album
              </button>
            )}
          </div>
        )}
      </section>

      {/* Modal for adding photos from library */}
      {isAddingPhotos && (
        <div className="fixed inset-0 z-[70] bg-surface flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="h-16 px-container-padding flex justify-between items-center border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
            <button
              onClick={() => setIsAddingPhotos(false)}
              className="text-on-surface-variant font-bold text-label-md px-3 py-1.5 rounded-xl hover:bg-surface-variant/30"
            >
              Annuler
            </button>
            <h3 className="text-headline-md font-bold">Ajouter des photos à l'album</h3>
            <button
              onClick={handleAddPhotos}
              disabled={selectedForAlbum.length === 0}
              className={`font-bold text-label-md px-5 py-2 rounded-full transition-all ${
                selectedForAlbum.length > 0
                  ? 'bg-primary text-on-primary shadow-md active:scale-95'
                  : 'bg-surface-container-high text-on-surface-variant opacity-50'
              }`}
            >
              Ajouter ({selectedForAlbum.length})
            </button>
          </header>

          <main className="flex-grow overflow-y-auto p-grid-gap bg-surface-container-lowest">
            {availablePhotos.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-grid-gap max-w-6xl mx-auto">
                {availablePhotos.map((p) => (
                  <SelectablePhotoItem
                    key={p.id}
                    photo={p}
                    isSelected={selectedForAlbum.includes(p.id)}
                    onClick={() => togglePhotoSelection(p.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-container-padding text-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
                  check_circle
                </span>
                <p className="text-headline-sm font-bold text-on-surface">Toutes vos photos sont déjà dans cet album !</p>
                <p className="text-body-sm text-on-surface-variant mt-2">
                  Importez de nouvelles photos pour enrichir votre photothèque.
                </p>
              </div>
            )}
          </main>
        </div>
      )}

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

export default AlbumDetail;
