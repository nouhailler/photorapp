import React, { useState, useMemo } from 'react';
import PhotoGrid from '../components/PhotoGrid';
import DetailView from '../components/DetailView';
import Editor from '../components/Editor';
import { usePhotos } from '../context/PhotoContext';
import type { Photo } from '../types/types';

const Gallery: React.FC = () => {
  const { photos, toggleFavorite } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return photos.filter(p => 
      p.alt.toLowerCase().includes(query) || 
      p.tags.some(t => t.toLowerCase().includes(query)) ||
      p.metadata?.location?.toLowerCase().includes(query)
    );
  }, [photos, searchQuery]);

  // Simple grouping by date
  const groupedPhotos = useMemo(() => filteredPhotos.reduce((acc, photo) => {
    const date = photo.date; 
    if (!acc[date]) acc[date] = [];
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, typeof photos>), [filteredPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseDetail = () => {
    setSelectedPhoto(null);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-section-margin">
      {/* Search Section */}
      <div className="px-container-padding">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">auto_awesome</span>
          <input 
            className="w-full h-12 bg-surface-container-low border-none rounded-2xl pl-12 pr-4 font-body-lg text-body-lg focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/60 outline-none" 
            placeholder="Search your memories with AI..." 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Suggested for you (Horizontal Scroll) */}
      {!searchQuery && (
        <section className="px-container-padding">
          <h3 className="text-label-md font-semibold text-on-surface-variant mb-4 uppercase tracking-widest">Suggested for you</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-container-padding px-container-padding">
            <div className="relative h-48 w-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface-container-high group active:scale-95 transition-transform duration-300 shadow-sm cursor-pointer">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0KOUr7j62hFvipGJTu2S4QlEeZX_e3gF4FfSe0znd7Dx9o072DWbEgqDawucSAj7_qTf0YGYl_GoqBfmfc5viRcCMa5yBhtTn8AKpT7EQi3F6oKjZ1gub12mY5CjTNBm5gf3akL7gKJ509BI3ndLC5ODWeboyYHzY8wxdpqWVkm8NlDcstgOMO8ewF2kNnbiRghsjmTBJUHX_PtCfSDcTNrvUH9-ahJED4SsVN3QpIFfzmZFPDgJwUBY0L7s08qQTCqiD4aWxOaM" alt="Mountain Escape" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                <p className="text-white text-headline-md font-bold">Mountain Escape</p>
                <p className="text-white/80 text-label-sm">48 Photos • 2023</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid */}
      {Object.entries(groupedPhotos).length > 0 ? (
        Object.entries(groupedPhotos).map(([date, datePhotos], index) => (
          <section key={date}>
            <div className="px-container-padding mb-3 flex justify-between items-end">
              <h2 className="text-headline-md font-bold text-on-surface">{date === new Date().toISOString().split('T')[0] ? 'Today' : date}</h2>
              <span className="text-label-md font-bold text-primary cursor-pointer hover:underline">Select</span>
            </div>
            <PhotoGrid photos={datePhotos} onPhotoClick={handlePhotoClick} featured={!searchQuery && index === 0} />
          </section>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-container-padding text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
          <p className="text-headline-md font-bold text-on-surface">No memories found</p>
          <p className="text-body-md text-on-surface-variant">Try searching for something else</p>
        </div>
      )}

      {/* Detail & Edit Modals */}
      {selectedPhoto && (
        <DetailView 
          photo={selectedPhoto} 
          onClose={handleCloseDetail} 
          onEdit={handleStartEdit} 
          onToggleFavorite={() => toggleFavorite(selectedPhoto.id)}
        />
      )}
      
      {isEditing && selectedPhoto && (
        <Editor 
          photo={selectedPhoto} 
          onClose={handleCloseEditor} 
        />
      )}

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200 z-40 group">
        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>
    </div>
  );
};


export default Gallery;
