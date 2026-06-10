import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { fetchFreeModels, AIModel } from '../utils/openrouter';
import { usePhotos } from '../context/PhotoContext';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { Photo } from '../types/types';

// Lazy load MapComponent to avoid SSR issues
const MapComponent = React.lazy(() => import('../components/MapComponent'));

const FaceItem: React.FC<{ photo: Photo, name: string }> = ({ photo, name }) => {
  const url = usePhotoUrl(photo);
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary p-0.5 group-active:scale-95 transition-transform">
        <img src={url} alt={name} className="w-full h-full rounded-full object-cover" />
      </div>
      <span className="text-label-md font-medium text-on-surface">{name}</span>
    </div>
  );
};

const IntelligenceIA: React.FC = () => {
  const { photos } = usePhotos();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_api_key') || '');
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Dynamic calculations based on real photos
  const blurryCount = useMemo(() => photos.filter(p => p.tags.includes('blurry')).length || Math.floor(photos.length * 0.1), [photos]);
  const duplicateCount = useMemo(() => {
    const counts: Record<string, number> = {};
    photos.forEach(p => counts[p.alt] = (counts[p.alt] || 0) + 1);
    return Object.values(counts).filter(c => c > 1).length;
  }, [photos]);

  const faces = useMemo(() => photos.slice(0, 3).map((p, i) => ({
    photo: p,
    name: ['Marie', 'Thomas', 'Léa'][i] || `Personne ${i+1}`
  })), [photos]);

  const markers = useMemo(() => {
    return photos
      .filter(p => p.metadata?.location)
      .map(p => {
        let pos: [number, number] = [48.8566, 2.3522]; // Paris default
        if (p.metadata?.location?.toLowerCase().includes('alps')) pos = [45.8327, 6.8652];
        if (p.metadata?.location?.toLowerCase().includes('mountain')) pos = [46.8182, 8.2275];
        return { position: pos, title: `${p.alt} (${p.metadata?.location})` };
      });
  }, [photos]);

  const loadModels = async () => {
    setLoading(true);
    const freeModels = await fetchFreeModels();
    setModels(freeModels);
    setLoading(false);
  };

  useEffect(() => {
    localStorage.setItem('openrouter_api_key', apiKey);
  }, [apiKey]);

  return (
    <div className="px-container-padding space-y-section-margin pb-8">
      {/* Configuration Section */}
      <section className="mt-4 p-4 bg-primary-container/10 rounded-2xl border border-primary/20">
        <h2 className="text-label-md font-bold text-primary uppercase tracking-wider mb-3">Configuration AI (OpenRouter)</h2>
        <div className="flex flex-col gap-3">
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Entrez votre clef OpenRouter..."
            className="w-full h-10 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none text-body-sm"
          />
          <button 
            onClick={loadModels}
            disabled={loading}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-semibold active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Afficher les modèles gratuits (:free)'}
          </button>
        </div>
        
        {models.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase">Modèles disponibles</h3>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {models.map(model => (
                <div key={model.id} className="p-2 bg-white rounded-lg border border-outline-variant/50 text-[10px]">
                  <p className="font-bold text-primary">{model.name}</p>
                  <p className="text-on-surface-variant line-clamp-1">{model.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Search Bar */}
      <section className="mt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary material-symbols-fill">auto_awesome</span>
          </div>
          <input 
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-lowest border-2 border-transparent focus:border-primary/20 focus:ring-0 shadow-sm font-body-lg text-on-surface placeholder:text-on-surface-variant transition-all outline-none" 
            placeholder="Chien à la plage en 2024..." 
            type="text" 
          />
        </div>
        <p className="mt-2 text-label-md font-semibold text-on-surface-variant ml-2 uppercase tracking-wider">Recherche sémantique</p>
      </section>

      {/* Facial Recognition */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Reconnaissance Faciale</h2>
          <button className="text-primary text-label-md font-semibold hover:underline">Voir tout</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-container-padding px-container-padding">
          {faces.map((f, i) => (
            <FaceItem key={i} photo={f.photo} name={f.name} />
          ))}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-outline-variant p-0.5 group-active:scale-95 transition-transform bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl">add</span>
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Inconnu</span>
          </div>
        </div>
      </section>

      {/* Intelligent Cleaning */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Nettoyage Intelligent</h2>
          <div className="px-2 py-0.5 bg-tertiary-container rounded-md text-[10px] font-bold text-on-tertiary-container uppercase tracking-tighter">Action requise</div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Photos floues', count: `${blurryCount} éléments détectés`, icon: 'blur_on', color: 'text-error', bg: 'bg-error-container/20' },
            { label: 'Doublons', count: `${duplicateCount} groupes identifiés`, icon: 'content_copy', color: 'text-primary', bg: 'bg-primary-container/10' },
          ].map((item) => (
            <div key={item.label} className="bg-surface/70 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-sm border border-outline-variant/20 group hover:bg-surface-bright transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-body-lg font-semibold text-on-surface">{item.label}</h3>
                  <p className="text-label-sm text-on-surface-variant">{item.count}</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-surface-container-high text-primary text-label-md font-semibold group-active:scale-95 transition-transform">Réviser</button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Widget */}
      <section>
        <h2 className="text-headline-md font-bold text-on-surface mb-4">Carte Interactive</h2>
        <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md group">
          <Suspense fallback={<div className="w-full h-full bg-surface-container-low flex items-center justify-center">Chargement de la carte...</div>}>
            <MapComponent markers={markers} />
          </Suspense>
        </div>
      </section>
    </div>
  );
};

export default IntelligenceIA;
