import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import PhotoGrid from '../components/PhotoGrid';
import DetailView from '../components/DetailView';
import Editor from '../components/Editor';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { Photo } from '../types/types';

const SelectablePhotoItem: React.FC<{ photo: Photo, isSelected: boolean, onClick: () => void }> = ({ photo, isSelected, onClick }) => {
  const url = usePhotoUrl(photo);
  return (
    <div 
      className="relative aspect-square cursor-pointer group"
      onClick={onClick}
    >
      <img src={url} className="w-full h-full object-cover" alt="" />
      <div className={`absolute inset-0 flex items-center justify-center transition-all ${isSelected ? 'bg-primary/40' : 'bg-black/0 group-hover:bg-black/10'}`}>
        {isSelected ? (
          <span className="material-symbols-outlined text-white text-3xl material-symbols-fill scale-110 transition-transform">check_circle</span>
        ) : (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white/70 shadow-sm" />
        )}
      </div>
    </div>
  );
};

const AlbumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { albums, photos, toggleFavorite, addPhotosToAlbum } = usePhotos();
  
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [selectedForAlbum, setSelectedForAlbum] = useState<string[]>([]);

  const album = albums.find(a => a.id === id);
  const albumPhotos = photos.filter(p => p.albumIds.includes(id || ''));

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-container-padding text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">folder_off</span>
        <p className="text-headline-md font-bold text-on-surface">Album introuvable</p>
        <button onClick={() => navigate('/albums')} className="mt-4 text-primary font-bold">Retour aux albums</button>
      </div>
    );
  }

  const handleAddPhotos = () => {
    addPhotosToAlbum(selectedForAlbum, album.id);
    setIsAddingPhotos(false);
    setSelectedForAlbum([]);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedForAlbum(prev => 
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  // Only show photos that are NOT already in the album
  const availablePhotos = photos.filter(p => !p.albumIds.includes(album.id));

  return (
    <div className="space-y-section-margin pb-24">
      {/* Header */}
      <section className="px-container-padding pt-4">
        <button onClick={() => navigate('/albums')} className="flex items-center gap-1 text-primary text-label-md font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Retour aux albums
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface leading-tight">{album.title}</h2>
            <p className="text-label-md font-medium text-on-surface-variant mt-1">{albumPhotos.length} Photos</p>
          </div>
          <button 
            onClick={() => setIsAddingPhotos(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-2xl text-label-md font-bold shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
            Ajouter
          </button>
        </div>
      </section>

      {/* Grid */}
      <section>
        {albumPhotos.length > 0 ? (
          <PhotoGrid photos={albumPhotos} onPhotoClick={setSelectedPhoto} />
        ) : (
          <div className="mx-container-padding py-20 text-center border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">photo_library</span>
            </div>
            <p className="text-on-surface font-bold text-headline-sm">Cet album est vide</p>
            <p className="text-on-surface-variant text-body-sm mt-1">Commencez par ajouter des souvenirs.</p>
            <button 
              onClick={() => setIsAddingPhotos(true)}
              className="mt-6 px-8 py-3 bg-primary-container text-on-primary-container rounded-2xl font-bold text-label-md active:scale-95 transition-all shadow-sm"
            >
              Ajouter mes premières photos
            </button>
          </div>
        )}
      </section>

      {/* Selection Modal for adding photos */}
      {isAddingPhotos && (
        <div className="fixed inset-0 z-[70] bg-surface flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="h-16 px-container-padding flex justify-between items-center border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
            <button onClick={() => setIsAddingPhotos(false)} className="text-on-surface-variant font-bold text-label-md">Annuler</button>
            <h3 className="text-headline-md font-bold">Ajouter à l'album</h3>
            <button 
              onClick={handleAddPhotos}
              disabled={selectedForAlbum.length === 0}
              className={`font-bold text-label-md px-4 py-1.5 rounded-full transition-all ${selectedForAlbum.length > 0 ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-high text-on-surface-variant opacity-50'}`}
            >
              Ajouter ({selectedForAlbum.length})
            </button>
          </header>
          
          <main className="flex-grow overflow-y-auto p-grid-gap bg-surface-container-lowest">
            {availablePhotos.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-grid-gap">
                {availablePhotos.map(p => (
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
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">check_circle</span>
                <p className="text-headline-sm font-bold text-on-surface">Toutes vos photos sont déjà ici !</p>
                <p className="text-body-sm text-on-surface-variant mt-2">Importez de nouvelles photos depuis l'onglet Partage.</p>
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
        <Editor 
          photo={selectedPhoto} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </div>
  );
};

export default AlbumDetail;
