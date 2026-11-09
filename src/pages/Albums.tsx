import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/usePhotos';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { Album, Photo, SmartAlbumCriteria } from '../types/types';

interface AlbumCardProps {
  album: Album;
  coverPhoto?: Photo;
  photoCount: number;
  onDelete: (id: string) => void;
  onRename: (album: Album) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, coverPhoto, photoCount, onDelete, onRename }) => {
  const navigate = useNavigate();
  const url = usePhotoUrl(coverPhoto || ({ url: 'https://images.unsplash.com/photo-1518128958364-65859d70aa41?auto=format&fit=crop&q=80&w=400' } as Photo));

  return (
    <div className="group relative flex flex-col gap-3">
      {/* Album Stack Effect */}
      <div
        onClick={() => navigate(`/albums/${album.id}`)}
        className="relative aspect-square rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <div className="absolute inset-x-[5%] -top-1.5 h-full bg-surface-container border border-outline-variant/20 rounded-2xl -z-10" />
        <div className="absolute inset-x-[10%] -top-3 h-full bg-surface-container-low border border-outline-variant/10 rounded-2xl -z-20" />

        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-surface-container-high">
          {coverPhoto ? (
            <img
              src={url}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant p-4 text-center">
              <span className="material-symbols-outlined text-4xl mb-1 opacity-40">photo_library</span>
              <span className="text-[11px] font-semibold opacity-60">Album vide</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          {/* Quick Actions overlay */}
          <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(album);
              }}
              title="Renommer l'album"
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Supprimer l'album "${album.title}" ? (Les photos seront conservées dans la bibliothèque)`)) {
                  onDelete(album.id);
                }
              }}
              title="Supprimer l'album"
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-error/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>

          {album.isSmart && (
            <div className="absolute top-3 right-3 bg-tertiary-container/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-on-tertiary-container text-[14px] material-symbols-fill">auto_awesome</span>
              <span className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-wider">Intelligent</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-1 cursor-pointer" onClick={() => navigate(`/albums/${album.id}`)}>
        <h3 className="text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
          {album.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-label-sm font-semibold text-primary">{photoCount} photos</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className="text-label-sm text-on-surface-variant">
            {album.isSmart ? 'Filtre automatique' : 'Manuel'}
          </span>
        </div>
      </div>
    </div>
  );
};

const Albums: React.FC = () => {
  const { albums, photos, createAlbum, updateAlbum, deleteAlbum } = usePhotos();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'count' | 'recent'>('recent');

  // Modal State for Album Creation / Rename
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [isSmartAlbum, setIsSmartAlbum] = useState(false);
  const [smartType, setSmartType] = useState<'favorites' | 'year' | 'gps' | 'custom'>('favorites');
  const [smartYear, setSmartYear] = useState<number>(new Date().getFullYear());

  const openCreateModal = () => {
    setEditingAlbum(null);
    setAlbumTitle('');
    setAlbumDesc('');
    setIsSmartAlbum(false);
    setIsModalOpen(true);
  };

  const openRenameModal = (album: Album) => {
    setEditingAlbum(album);
    setAlbumTitle(album.title);
    setAlbumDesc(album.description || '');
    setIsSmartAlbum(Boolean(album.isSmart));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    if (editingAlbum) {
      updateAlbum({
        ...editingAlbum,
        title: albumTitle.trim(),
        description: albumDesc.trim(),
      });
    } else {
      let smartCriteria: SmartAlbumCriteria | undefined;
      if (isSmartAlbum) {
        if (smartType === 'favorites') smartCriteria = { isFavorite: true };
        if (smartType === 'year') smartCriteria = { year: smartYear };
        if (smartType === 'gps') smartCriteria = { hasGps: true };
      }
      createAlbum(albumTitle.trim(), albumDesc.trim(), isSmartAlbum, smartCriteria);
    }

    setIsModalOpen(false);
  };

  // Compute photos belonging to each album
  const getAlbumPhotos = React.useCallback(
    (album: Album): Photo[] => {
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
    },
    [photos]
  );

  // Filter & Sort
  const filteredAlbums = useMemo(() => {
    let result = albums.filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result = [...result].sort((a, b) => {
      const countA = getAlbumPhotos(a).length;
      const countB = getAlbumPhotos(b).length;
      if (sortBy === 'count') return countB - countA;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // recent: by creation date or id
      return (b.createdAt || b.id).localeCompare(a.createdAt || a.id);
    });

    return result;
  }, [albums, getAlbumPhotos, searchQuery, sortBy]);

  // Real smart suggestions calculated from user library
  const favoritePhotosCount = useMemo(() => photos.filter((p) => p.isFavorite).length, [photos]);
  const gpsPhotosCount = useMemo(
    () => photos.filter((p) => typeof p.metadata?.latitude === 'number').length,
    [photos]
  );

  return (
    <div className="px-container-padding space-y-section-margin pb-24 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Collections & Albums</h2>
          <p className="text-body-sm text-on-surface-variant">
            {albums.length} albums organisés · Classement intelligent et manuel
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-label-md shadow-md active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Nouvel album</span>
        </button>
      </section>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un album..."
            className="w-full h-10 pl-10 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-sm focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-label-sm font-medium text-on-surface-variant">
          <span>Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'count' | 'recent')}
            className="h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface outline-none cursor-pointer"
          >
            <option value="recent">Plus récents</option>
            <option value="count">Nombre de photos</option>
            <option value="title">Nom alphabétique</option>
          </select>
        </div>
      </div>

      {/* Grid of Albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* New Album Action Card */}
        <button
          onClick={openCreateModal}
          className="group relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-outline-variant/60 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-[32px]">create_new_folder</span>
          </div>
          <span className="text-label-md font-bold text-on-surface group-hover:text-primary">
            Créer un album
          </span>
          <span className="text-[11px] text-on-surface-variant mt-1">Classique ou Intelligent</span>
        </button>

        {filteredAlbums.map((album) => {
          const albumPhotos = getAlbumPhotos(album);
          const coverPhoto = photos.find((p) => p.id === album.coverPhotoId) || albumPhotos[0];
          return (
            <AlbumCard
              key={album.id}
              album={album}
              photoCount={albumPhotos.length}
              coverPhoto={coverPhoto}
              onDelete={deleteAlbum}
              onRename={openRenameModal}
            />
          );
        })}
      </div>

      {/* Smart Spaces Section computed from real user data */}
      <section className="pt-8 border-t border-outline-variant/20">
        <h3 className="text-headline-md font-bold text-on-surface mb-2">Espaces Intelligents Instantanés</h3>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Suggestions créées dynamiquement à partir de vos photos réelles sans duplication de fichiers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Favorites Space */}
          <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] material-symbols-fill">star</span>
              </div>
              <div>
                <h4 className="text-headline-sm font-bold text-on-surface">Vos Favoris</h4>
                <p className="text-label-sm text-on-surface-variant">{favoritePhotosCount} photos étoilées</p>
              </div>
            </div>
            <button
              onClick={() => {
                createAlbum('Mes Favoris', 'Album intelligent regroupant toutes vos photos favorites', true, { isFavorite: true });
              }}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-bold active:scale-95"
            >
              Créer l'album
            </button>
          </div>

          {/* GPS Space */}
          <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">explore</span>
              </div>
              <div>
                <h4 className="text-headline-sm font-bold text-on-surface">Photos Géolocalisées</h4>
                <p className="text-label-sm text-on-surface-variant">{gpsPhotosCount} photos avec coordonnées GPS</p>
              </div>
            </div>
            <button
              onClick={() => {
                createAlbum('Carnet de voyage', 'Photos disposant de coordonnées GPS', true, { hasGps: true });
              }}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-bold active:scale-95"
            >
              Créer l'album
            </button>
          </div>
        </div>
      </section>

      {/* Create / Edit Album Modal (No window.prompt!) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-headline-sm font-bold text-on-surface">
                {editingAlbum ? 'Renommer l\'album' : 'Nouvel album'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                  Titre de l'album *
                </label>
                <input
                  type="text"
                  required
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="Ex : Vacances en Bretagne 2024"
                  className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm focus:border-primary outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                  Description (facultative)
                </label>
                <input
                  type="text"
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  placeholder="Ex : Souvenirs de famille et paysages"
                  className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm focus:border-primary outline-none"
                />
              </div>

              {!editingAlbum && (
                <div className="p-4 bg-surface-container-low rounded-2xl space-y-3 border border-outline-variant/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSmartAlbum}
                      onChange={(e) => setIsSmartAlbum(e.target.checked)}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-label-md font-bold text-on-surface">Album Intelligent</span>
                      <p className="text-[11px] text-on-surface-variant">
                        Mise à jour automatique basée sur des critères
                      </p>
                    </div>
                  </label>

                  {isSmartAlbum && (
                    <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                      <label className="block text-label-xs font-semibold text-on-surface-variant">
                        Critère de sélection :
                      </label>
                      <select
                        value={smartType}
                        onChange={(e) => setSmartType(e.target.value as 'favorites' | 'year' | 'gps' | 'custom')}
                        className="w-full h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                      >
                        <option value="favorites">Toutes les photos favorites</option>
                        <option value="gps">Toutes les photos avec géolocalisation</option>
                        <option value="year">Toutes les photos d'une année précise</option>
                      </select>

                      {smartType === 'year' && (
                        <input
                          type="number"
                          value={smartYear}
                          onChange={(e) => setSmartYear(parseInt(e.target.value, 10))}
                          className="w-full h-10 px-3 bg-surface border border-outline-variant/40 rounded-xl text-label-sm"
                          placeholder="Ex : 2024"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-variant/30"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!albumTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md active:scale-95 disabled:opacity-50"
                >
                  {editingAlbum ? 'Mettre à jour' : 'Créer l\'album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Albums;
