import React from 'react';
import { usePhotos } from '../context/PhotoContext';
import type { Photo } from '../types/types';

const Sharing: React.FC = () => {
  const { addPhotos } = usePhotos();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
        id: Date.now().toString() + index,
        url: URL.createObjectURL(file),
        alt: file.name,
        date: new Date().toISOString().split('T')[0],
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Manual Import',
          resolution: 'Unknown',
          date: new Date().toLocaleString(),
        }
      }));
      addPhotos(newPhotos);
      alert(`${newPhotos.length} photos imported successfully!`);
    }
  };

  return (
    <div className="px-container-padding space-y-section-margin max-w-4xl mx-auto pb-8">
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      {/* Header Text */}
      <section>
        <h2 className="text-headline-lg font-bold text-on-surface">Transfert de contenu</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">Gérez l'importation et l'exportation de vos souvenirs précieux avec précision.</p>
      </section>

      {/* Import Section */}
      <section className="space-y-4">
        <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">Importer des photos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Cet appareil', icon: 'smartphone', bg: 'bg-primary-fixed', color: 'text-primary' },
            { label: 'Google Photos', icon: 'photo_library', bg: 'bg-surface-container-high', color: 'text-primary' },
            { label: 'Google Drive', icon: 'add_to_drive', bg: 'bg-surface-container-high', color: 'text-[#34A853]' },
            { label: 'Carte SD', icon: 'sd_card', bg: 'bg-surface-container-high', color: 'text-on-surface-variant' },
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={handleImportClick}
              className="flex flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 hover:border-primary/40 transition-all group active:scale-95"
            >
              <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <span className="text-label-md font-semibold text-on-surface">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Export Section */}
      <section className="space-y-4">
        <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">Exporter & Partager</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Télécharger', desc: 'Enregistrer sur cet appareil', icon: 'download', bg: 'bg-primary-container', color: 'text-on-primary-container' },
            { label: 'Exporter en ZIP', desc: 'Compression haute fidélité', icon: 'folder_zip', bg: 'bg-surface-container-highest', color: 'text-on-surface-variant' },
            { label: 'Lien de partage privé', desc: 'Sécurisé avec expiration', icon: 'link', bg: 'bg-tertiary-container', color: 'text-on-tertiary-container' },
            { label: 'Flux de travail Cloud', desc: 'Synchronisation Adobe / iCloud', icon: 'cloud_sync', bg: 'bg-primary-fixed-dim', color: 'text-on-primary-fixed-variant' },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex items-center justify-between group hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <p className="text-label-md font-bold text-on-surface">{item.label}</p>
                  <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="space-y-4">
        <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">Importations récentes</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk3lZ0fMgtHoSTuEKFpKw4gAFPhAXwStck_RIdqjY5FRd9EFqGP7pVIS5boswbG3F0mk3GtW-eSf-SIfEiH9wSqzyu5AXudJnUa_d_g_-gEtb9E586vADHG6l8xvpGos1L53p8ZQQq6MZRxmUmv19n59xej9MH8UZfbAqIwZD_T6RQzS4YWN334Y1iXZtnwgcWwJUzXRVvqvkzVqrdc_EkMmJgluwIWM_OdSlsP76lU2omkW0CbC1pFQF-4bjkv-qD9QR2akh8tgs" alt="Recent import" className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <p className="text-label-md font-bold text-on-surface">12 photos de Google Photos</p>
                <span className="text-[10px] text-on-surface-variant">il y a 5 min</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                <p className="text-[10px] text-tertiary font-bold">Terminé</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sharing;
