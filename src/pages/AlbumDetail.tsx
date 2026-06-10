import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import PhotoGrid from '../components/PhotoGrid';
import DetailView from '../components/DetailView';
import Editor from '../components/Editor';
import type { Photo } from '../types/types';

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
    return <div className="p-8 text-center">Album not found.</div>;
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

  return (
    <div className="space-y-section-margin pb-8">
      {/* Header */}
      <section className="px-container-padding flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/albums')} className="flex items-center gap-1 text-primary text-label-md font-bold mb-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Albums
          </button>
          <h2 className="text-headline-lg font-bold text-on-surface">{album.title}</h2>
          <p className="text-body-sm text-on-surface-variant">{albumPhotos.length} Photos</p>
        </div>
        <button 
          onClick={() => setIsAddingPhotos(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-xl text-label-md font-bold shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_photo_alternate</span>
          Add Photos
        </button>
      </section>

      {/* Grid */}
      <section>
        {albumPhotos.length > 0 ? (
          <PhotoGrid photos={albumPhotos} onPhotoClick={setSelectedPhoto} />
        ) : (
          <div className="px-container-padding py-20 text-center border-2 border-dashed border-outline-variant rounded-2xl mx-container-padding">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">photo_library</span>
            <p className="text-on-surface-variant font-medium">This album is empty</p>
            <button 
              onClick={() => setIsAddingPhotos(true)}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Add your first photos
            </button>
          </div>
        )}
      </section>

      {/* Selection Modal for adding photos */}
      {isAddingPhotos && (
        <div className="fixed inset-0 z-[70] bg-surface flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="h-16 px-container-padding flex justify-between items-center border-b border-outline-variant/30">
            <button onClick={() => setIsAddingPhotos(false)} className="text-on-surface font-bold">Cancel</button>
            <h3 className="text-headline-md font-bold">Select Photos</h3>
            <button 
              onClick={handleAddPhotos}
              disabled={selectedForAlbum.length === 0}
              className={`font-bold ${selectedForAlbum.length > 0 ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              Add ({selectedForAlbum.length})
            </button>
          </header>
          <main className="flex-grow overflow-y-auto p-grid-gap">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-grid-gap">
              {photos.map(p => (
                <div 
                  key={p.id} 
                  className="relative aspect-square cursor-pointer"
                  onClick={() => togglePhotoSelection(p.id)}
                >
                  <img src={p.url} className="w-full h-full object-cover" alt="" />
                  <div className={`absolute inset-0 flex items-center justify-center transition-all ${selectedForAlbum.includes(p.id) ? 'bg-primary/40' : 'bg-transparent'}`}>
                    {selectedForAlbum.includes(p.id) && (
                      <span className="material-symbols-outlined text-white text-3xl material-symbols-fill">check_circle</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
