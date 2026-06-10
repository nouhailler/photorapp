import React, { useState } from 'react';
import type { Photo } from '../types/types';
import { usePhotos } from '../context/PhotoContext';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

interface DetailViewProps {
  photo: Photo;
  onClose: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ photo: initialPhoto, onClose, onEdit, onToggleFavorite }) => {
  const [showInfo, setShowInfo] = useState(false);
  const { deletePhoto, photos } = usePhotos();
  
  // Use the photo from context to get reactive updates (like favorite toggle)
  const photo = photos.find(p => p.id === initialPhoto.id) || initialPhoto;
  const url = usePhotoUrl(photo);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhoto(photo.id);
      onClose();
    }
  };

  const photoStyle = photo.adjustments ? {
    filter: `${photo.adjustments.filter || ''} brightness(${100 + photo.adjustments.brightness}%) contrast(${100 + photo.adjustments.contrast}%) saturate(${100 + photo.adjustments.saturation}%)`,
    transform: `rotate(${photo.adjustments.rotation || 0}deg)`,
  } : {};

  return (
    <div className="fixed inset-0 z-[55] bg-black flex flex-col animate-in fade-in duration-300">
      {/* Top Bar */}
      <header className={`fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 h-16 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300`}>
        <button onClick={onClose} className="p-2 text-white bg-black/20 rounded-full backdrop-blur-md active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button onClick={onToggleFavorite} className="p-2 text-white bg-black/20 rounded-full backdrop-blur-md active:scale-90 transition-transform">
            <span className={`material-symbols-outlined ${photo.isFavorite ? 'material-symbols-fill text-primary' : ''}`}>favorite</span>
          </button>
          <button onClick={handleDelete} className="p-2 text-white bg-black/20 rounded-full backdrop-blur-md active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-error">delete</span>
          </button>
          <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-white bg-black/20 rounded-full backdrop-blur-md active:scale-90 transition-transform">
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </header>

      {/* Main Photo Canvas */}
      <main className="flex-grow flex items-center justify-center overflow-hidden touch-none" onClick={() => setShowInfo(false)}>
        <img 
          src={url} 
          alt={photo.alt} 
          className="max-w-full max-h-full object-contain transition-transform duration-500"
          style={photoStyle}
        />
        
        {/* Indicators Dots (as in design) */}
        <div className="absolute bottom-24 flex gap-2 justify-center w-full transition-opacity duration-300">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center gap-4 bg-gradient-to-t from-black/60 to-transparent">
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-bold text-label-md shadow-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Adjust
        </button>
        <button 
          onClick={async () => {
            try {
              if (navigator.share) {
                const shareData: ShareData = {
                  title: photo.alt,
                  text: 'Découvrez cette photo sur Gallery Pro !',
                };

                // If it's a local photo, try to share the file itself
                if (photo.storage === 'local') {
                  const blob = await fetch(url).then(r => r.blob());
                  const file = new File([blob], `${photo.alt || 'photo'}.jpg`, { type: blob.type });
                  
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                  } else {
                    shareData.url = url; // Fallback to object URL (might not work well outside browser)
                  }
                } else {
                  shareData.url = photo.url;
                }

                await navigator.share(shareData);
              } else {
                // Fallback: Copy URL to clipboard
                await navigator.clipboard.writeText(photo.storage === 'local' ? 'Photo locale (partage non supporté)' : photo.url);
                alert('Lien copié dans le presse-papier !');
              }
            } catch (error) {
              console.error('Erreur lors du partage :', error);
            }
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 text-white backdrop-blur-md font-bold text-label-md shadow-xl hover:bg-white/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">ios_share</span>
          Partager
        </button>
      </footer>

      {/* Info Panel */}
      <div className={`fixed right-0 top-0 bottom-0 w-80 z-20 bg-surface/90 backdrop-blur-xl border-l border-outline-variant/30 transition-transform duration-500 ease-in-out shadow-2xl ${showInfo ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full overflow-y-auto hide-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-headline-md font-bold text-on-surface">Details</h3>
            <button onClick={() => setShowInfo(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant/50">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          {photo.metadata && (
            <div className="space-y-6">
              <div>
                <span className="block text-label-md font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Date & Time</span>
                <p className="text-body-lg text-on-surface">{photo.metadata.date}</p>
              </div>
              
              <div className="w-full h-40 rounded-xl overflow-hidden bg-surface-variant relative mb-6">
                <img 
                  alt="Location" 
                  className="w-full h-full object-cover grayscale opacity-50" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhZpD51Anr_WZZ3Gz4_sjzR4axproPzgIoT-6wXdc_UCUHmfU9Enbn8U2V1vzhMFeEOYwv_9NnJV6zdEeA9OfOYjVElrxChDGT2wS-gg7nh0ZAuzYMCRqZfctFSJ4q0mO9MN5YbMVWPg-zCz20PMHCMYA1iVZKk0d0X6xCfbey2feurlAsz3ItrXTLrzrwLbCQELcpLG2BdfDR86qMSk3Eq8KgRczkD2Wptqmv4wtv3RfidkxWMRkAhkaONLdyvtqm9vUaG8kYVPQ" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-4 py-2 bg-surface shadow-md rounded-full text-label-md font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] material-symbols-fill">location_on</span>
                    {photo.metadata.location}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-label-md font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Device</span>
                  <p className="text-body-lg text-on-surface">{photo.metadata.device}</p>
                </div>
                <div>
                  <span className="block text-label-md font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Resolution</span>
                  <p className="text-body-lg text-on-surface">{photo.metadata.resolution}</p>
                </div>
              </div>

              {photo.metadata.exif && (
                <div className="pt-6 border-t border-outline-variant/30 space-y-4">
                  <span className="block text-label-md font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">EXIF Data</span>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">shutter_speed</span>
                    <span className="text-body-sm">{photo.metadata.exif.shutterSpeed} · {photo.metadata.exif.aperture} · ISO {photo.metadata.exif.iso}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">straighten</span>
                    <span className="text-body-sm">{photo.metadata.exif.focalLength}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailView;
