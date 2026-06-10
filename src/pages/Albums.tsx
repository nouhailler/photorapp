import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { Album, Photo } from '../types/types';

interface AlbumCardProps {
  album: Album;
  coverPhoto?: Photo;
  onDelete: (id: string) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, coverPhoto, onDelete }) => {
  const navigate = useNavigate();
  const url = usePhotoUrl(coverPhoto || { url: 'https://via.placeholder.com/400' } as Photo);

  return (
    <div className="group relative flex flex-col gap-3">
      {/* Album Stack Effect */}
      <div 
        onClick={() => navigate(`/albums/${album.id}`)}
        className="relative aspect-square rounded-xl cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* Decorative background layers for stack effect */}
        <div className="absolute inset-x-[5%] -top-1 h-full bg-surface-container border border-outline-variant/20 rounded-xl -z-10" />
        <div className="absolute inset-x-[10%] -top-2 h-full bg-surface-container-low border border-outline-variant/10 rounded-xl -z-20" />
        
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          <img 
            src={coverPhoto ? url : 'https://images.unsplash.com/photo-1518128958364-65859d70aa41?auto=format&fit=crop&q=80&w=400'} 
            alt={album.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Supprimer l'album "${album.title}" ?`)) {
                onDelete(album.id);
              }
            }}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/80"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>

          {album.isPrivate && (
            <div className="absolute top-3 right-3 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-on-surface text-[14px]">shield</span>
              <span className="text-label-sm font-medium text-on-surface">Privé</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-1 cursor-pointer" onClick={() => navigate(`/albums/${album.id}`)}>
        <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">{album.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-label-sm font-medium text-on-surface-variant">{album.photoCount} Photos</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className={`text-label-sm font-medium ${album.isShared ? 'text-primary' : 'text-on-surface-variant'}`}>
            {album.isShared ? 'Partagé' : 'Personnel'}
          </span>
        </div>
      </div>
    </div>
  );
};

const Albums: React.FC = () => {
  const { albums, photos, createAlbum, deleteAlbum } = usePhotos();

  const handleCreateAlbum = () => {
    const title = window.prompt('Nom de l\'album :');
    if (title) {
      createAlbum(title);
    }
  };

  return (
    <div className="px-container-padding space-y-section-margin pb-24">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Collections</h2>
          <p className="text-body-sm text-on-surface-variant">Gérez vos albums et espaces partagés</p>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Create New Album Card */}
        <button 
          onClick={handleCreateAlbum}
          className="group relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-primary-fixed/10 transition-all duration-300 active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-[32px]">create_new_folder</span>
          </div>
          <span className="text-label-md font-semibold text-on-surface-variant group-hover:text-primary">Nouvel Album</span>
        </button>

        {albums.map((album) => {
          const albumPhotos = photos.filter(p => p.albumIds.includes(album.id));
          const coverPhoto = photos.find(p => p.id === album.coverPhotoId) || albumPhotos[0];
          return (
            <AlbumCard 
              key={album.id} 
              album={{ ...album, photoCount: albumPhotos.length }} 
              coverPhoto={coverPhoto} 
              onDelete={deleteAlbum}
            />
          );
        })}
      </div>

      {/* AI Curated Spaces (Bento-ish) */}
      <section className="mt-section-margin">
        <h2 className="text-headline-md font-bold text-on-surface mb-6">AI Curated Spaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[400px]">
          <div className="md:col-span-8 group relative rounded-2xl overflow-hidden bg-surface-container-high cursor-pointer">
            <img 
              alt="Architectural Study" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbjJb5RN5Jxk2BFvw7gyHfhlNRbrflosjKXArvwzovUatFjV18EPYMM1QJtQbXVf8kDsyJAMSw-2PcbgOED7ZcwAoHsD9CAM0OmSh590cI1JK_SGtbGzk3LU4rbYcKuJ9epzrAMa0FQKXaFDNFLl59mMUB0cZ5IJZfc5S7kdTuCxMfeTO1CHuCeHprTQzF6rbanu8vWwHvTIeFJkXP-8eFEn6IxVbuCfhtW9lvMyMUVvjy1a-lknci3G1Q0O5Rb-03qRSYTIC-jCI" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-tertiary-fixed text-[20px] material-symbols-fill">auto_awesome</span>
                <span className="text-label-md font-semibold text-tertiary-fixed uppercase tracking-widest">Smart Album</span>
              </div>
              <h4 className="text-headline-lg font-bold text-white mb-2">Architectural Study</h4>
              <p className="text-body-sm text-white/80 max-w-md">Automatically grouped photos of modern interiors and structural designs.</p>
            </div>
          </div>
          <div className="md:col-span-4 group relative rounded-2xl overflow-hidden bg-primary cursor-pointer flex flex-col justify-between p-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">share_reviews</span>
            </div>
            <div>
              <h4 className="text-headline-md font-bold text-white mb-2">Pending Invites</h4>
              <p className="text-body-sm text-on-primary-container">You have 3 new album invitations from your 'Work' circle.</p>
              <button className="mt-4 w-full py-2 bg-white text-primary rounded-xl text-label-md font-semibold hover:bg-surface-bright transition-colors">Review Invites</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Albums;
