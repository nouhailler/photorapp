import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { usePhotos } from '../context/usePhotos';
import { findExactDuplicates, findSimilarPhotos } from '../services/duplicateService';
import type { DuplicateGroup } from '../services/duplicateService';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import { fetchFreeModels } from '../utils/openrouter';
import type { AIModel } from '../utils/openrouter';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  isFaceGroupingEnabled,
  setFaceGroupingEnabled,
  getSavedPersonGroups,
  clusterPhotosIntoPersonGroups,
  updatePersonGroupName,
  clearAllFaceData,
} from '../services/faceService';
import type { Photo, PersonGroup } from '../types/types';


// Lazy load MapComponent to avoid SSR/window issues
const MapComponent = React.lazy(() => import('../components/MapComponent'));

const PhotoThumbnail: React.FC<{ photo: Photo; className?: string }> = ({ photo, className = 'w-16 h-16' }) => {
  const url = usePhotoUrl(photo);
  return <img src={url} alt={photo.alt} className={`${className} object-cover rounded-xl`} />;
};

const IntelligenceIA: React.FC = () => {
  const { photos, deletePhoto, analyzeAllPhotos } = usePhotos();

  // Local Analysis Progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number } | null>(null);

  // Review Modals
  const [activeReview, setActiveReview] = useState<'blurry' | 'duplicates' | null>(null);

  // Face / People Grouping (Strictly Opt-in, Local)
  const [facesEnabled, setFacesEnabled] = useState<boolean>(() => isFaceGroupingEnabled());
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([]);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingPersonName, setEditingPersonName] = useState('');
  const [faceMessage, setFaceMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (facesEnabled) {
      getSavedPersonGroups().then((groups) => {
        if (active) setPersonGroups(groups);
      });
    }
    return () => {
      active = false;
    };
  }, [facesEnabled]);

  // OpenRouter Config (Optional External LLM)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_api_key') || '');
  const [models, setModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);

  // Exact & Perceptual Duplicates
  const exactDuplicates = useMemo(() => findExactDuplicates(photos), [photos]);
  const similarPhotos = useMemo(() => findSimilarPhotos(photos), [photos]);
  const allDuplicateGroups: DuplicateGroup[] = useMemo(
    () => [...exactDuplicates, ...similarPhotos],
    [exactDuplicates, similarPhotos]
  );

  // Real Analyzed Photos
  const analyzedPhotos = useMemo(
    () => photos.filter((p) => p.metadata?.analysis !== undefined),
    [photos]
  );

  const sceneDistribution = useMemo(() => {
    const counts: Record<string, { label: string; count: number }> = {};
    for (const p of photos) {
      for (const st of p.metadata?.analysis?.sceneTags || []) {
        if (!counts[st.category]) {
          counts[st.category] = { label: st.label, count: 0 };
        }
        counts[st.category].count++;
      }
    }
    return Object.entries(counts).map(([category, info]) => ({
      category,
      label: info.label,
      count: info.count,
    }));
  }, [photos]);

  const lowQualityPhotos = useMemo(
    () =>
      analyzedPhotos.filter(
        (p) =>
          p.metadata?.analysis?.isBlurry ||
          p.metadata?.analysis?.isUnderexposed ||
          p.metadata?.analysis?.isOverexposed
      ),
    [analyzedPhotos]
  );

  // Trigger Local Computer Vision Analysis
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeAllPhotos((curr, tot) => {
        setAnalysisProgress({ current: curr, total: tot });
      });
    } catch (e) {
      console.error('Analysis batch error:', e);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  const loadModels = async () => {
    setLoadingModels(true);
    const freeModels = await fetchFreeModels();
    setModels(freeModels);
    setLoadingModels(false);
  };

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('openrouter_api_key', val);
  };

  const handleToggleFaceGrouping = async (enabled: boolean) => {
    setFaceGroupingEnabled(enabled);
    setFacesEnabled(enabled);
    if (enabled) {
      const groups = await clusterPhotosIntoPersonGroups(photos);
      setPersonGroups(groups);
    } else {
      setPersonGroups([]);
    }
  };

  const handleRescanFaces = async () => {
    const groups = await clusterPhotosIntoPersonGroups(photos);
    setPersonGroups(groups);
    setFaceMessage(`${groups.length} groupe(s) de visages détectés localement.`);
    setTimeout(() => setFaceMessage(''), 3000);
  };

  const handleSavePersonName = async (personId: string) => {
    await updatePersonGroupName(personId, editingPersonName);
    const refreshed = await getSavedPersonGroups();
    setPersonGroups(refreshed);
    setEditingPersonId(null);
  };

  const handleWipeFaceData = async () => {
    if (
      window.confirm(
        'Voulez-vous vraiment supprimer de manière irréversible tous les groupes de personnes et données de visages locales ? Vos photos originales resteront intactes.'
      )
    ) {
      await clearAllFaceData();
      setFacesEnabled(false);
      setPersonGroups([]);
      setFaceMessage('Toutes les données biométriques locales ont été effacées.');
      setTimeout(() => setFaceMessage(''), 4000);
    }
  };


  return (
    <div className="px-container-padding space-y-section-margin max-w-6xl mx-auto pb-28">
      {/* Page Title & Local-First Privacy Banner */}
      <section className="pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-headline-lg font-bold text-on-surface">Intelligence Photographique</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider">
                100% Local
              </span>
              <HelpTooltip
                title="Intelligence & Vision par Ordinateur"
                text="Les analyses de flou, d'exposition et de similarité s'exécutent entièrement sur votre appareil sans envoyer vos photos sur aucun serveur."
              />
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Analyses scientifiques exécutées localement dans votre navigateur : détection de flou, doublons et exposition.
            </p>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-label-md shadow-md active:scale-95 disabled:opacity-50 transition-all shrink-0"
          >
            <span className={`material-symbols-outlined text-[20px] ${isAnalyzing ? 'animate-spin' : 'material-symbols-fill'}`}>
              {isAnalyzing ? 'sync' : 'auto_fix_high'}
            </span>
            <span>{isAnalyzing ? 'Analyse en cours...' : 'Analyser la bibliothèque'}</span>
          </button>
        </div>

        {/* Progress bar if analyzing */}
        {isAnalyzing && analysisProgress && (
          <div className="mt-4 p-4 bg-primary-container/20 rounded-2xl border border-primary/30 space-y-2">
            <div className="flex justify-between text-label-sm font-bold text-primary">
              <span>Analyse des pixels par vision par ordinateur...</span>
              <span>{analysisProgress.current} / {analysisProgress.total}</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((analysisProgress.current / analysisProgress.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Nettoyage Intelligent Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-headline-md font-bold text-on-surface">Nettoyage & Optimisation</h3>
            <span className="px-2 py-0.5 bg-surface-container-high rounded-md text-[11px] font-bold text-on-surface-variant">
              {analyzedPhotos.length} / {photos.length} photos analysées
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Blurry / Poor Quality */}
          <div className="bg-surface/80 backdrop-blur-xl rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">blur_on</span>
              </div>
              <div>
                <h4 className="text-body-lg font-bold text-on-surface">Photos floues ou mal exposées</h4>
                <p className="text-label-sm text-on-surface-variant">
                  {analyzedPhotos.length === 0
                    ? 'Aucune analyse effectuée. Lancez l\'analyse locale.'
                    : `${lowQualityPhotos.length} photo(s) détectée(s)`}
                </p>
              </div>
            </div>
            <button
              disabled={lowQualityPhotos.length === 0}
              onClick={() => setActiveReview('blurry')}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-primary font-bold text-label-sm hover:bg-surface-variant active:scale-95 disabled:opacity-30 transition-all shrink-0"
            >
              Réviser
            </button>
          </div>

          {/* Card 2: Duplicates */}
          <div className="bg-surface/80 backdrop-blur-xl rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">content_copy</span>
              </div>
              <div>
                <h4 className="text-body-lg font-bold text-on-surface">Doublons & Similitudes</h4>
                <p className="text-label-sm text-on-surface-variant">
                  {allDuplicateGroups.length === 0
                    ? 'Aucun doublon trouvé dans la photothèque.'
                    : `${allDuplicateGroups.length} groupe(s) de doublons identifiés`}
                </p>
              </div>
            </div>
            <button
              disabled={allDuplicateGroups.length === 0}
              onClick={() => setActiveReview('duplicates')}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-primary font-bold text-label-sm hover:bg-surface-variant active:scale-95 disabled:opacity-30 transition-all shrink-0"
            >
              Réviser
            </button>
          </div>
        </div>
      </section>

      {/* Vision Locale & Catégories Détectées */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-headline-md font-bold text-on-surface">Classification Sémantique Locale</h3>
          <HelpTooltip
            title="Classification Automatique"
            text="Analyse colorimétrique, géométrique et spatiale exécutée dans votre navigateur pour identifier les paysages, portraits, couchers de soleil ou architectures."
          />
        </div>

        {sceneDistribution.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sceneDistribution.map((item) => (
              <div
                key={item.category}
                className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center justify-between"
              >
                <div>
                  <p className="text-label-md font-bold text-on-surface">{item.label}</p>
                  <p className="text-[11px] text-on-surface-variant">{item.count} photo(s)</p>
                </div>
                <span className="material-symbols-outlined text-primary/70 text-[22px]">label</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-body-sm text-on-surface-variant">
            Cliquez sur <strong>Analyser la bibliothèque</strong> ci-dessus pour classer automatiquement vos scènes (Nature, Portraits, Architecture, Plage, Nuit...).
          </div>
        )}
      </section>

      {/* Groupes de Personnes & Visages (Strictement Opt-In & Local) */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">face</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-headline-sm font-bold text-on-surface">Regroupement de Visages (Local)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                  Strictement privé
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Fonctionnement facultatif sur appareil uniquement. Aucun envoi vers un serveur ou registre tiers.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={facesEnabled}
              onChange={(e) => handleToggleFaceGrouping(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-2 text-label-xs font-bold text-on-surface">
              {facesEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </label>
        </div>

        {faceMessage && (
          <div className="p-3 bg-primary-container/30 text-primary rounded-xl text-label-xs font-bold">
            {faceMessage}
          </div>
        )}

        {facesEnabled ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleRescanFaces}
                className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-primary rounded-xl text-label-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">person_search</span>
                <span>Regrouper les portraits analysés</span>
              </button>

              <button
                onClick={handleWipeFaceData}
                className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-xl text-label-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>Effacement biométrique irréversible</span>
              </button>
            </div>

            {personGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {personGroups.map((group) => {
                  const cover = photos.find((p) => p.id === group.coverPhotoId);
                  return (
                    <div
                      key={group.id}
                      className="p-3 bg-surface rounded-2xl border border-outline-variant/20 flex items-center gap-3"
                    >
                      {cover ? (
                        <PhotoThumbnail photo={cover} className="w-12 h-12 rounded-full shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-surface-variant">person</span>
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        {editingPersonId === group.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingPersonName}
                              onChange={(e) => setEditingPersonName(e.target.value)}
                              className="w-full px-2 py-1 text-label-sm bg-surface-container rounded-lg border border-primary outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePersonName(group.id)}
                              className="p-1 text-primary hover:bg-primary/10 rounded-lg"
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-label-md font-bold text-on-surface truncate">{group.name}</p>
                            <button
                              onClick={() => {
                                setEditingPersonId(group.id);
                                setEditingPersonName(group.name);
                              }}
                              className="p-1 text-on-surface-variant hover:text-primary rounded-lg"
                              title="Nommer cette personne"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </div>
                        )}
                        <p className="text-[11px] text-on-surface-variant">
                          {group.photoIds.length} portrait(s)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-on-surface-variant">
                Aucun groupe de visages créé. Lancez d'abord l'analyse de bibliothèque pour détecter les portraits, puis cliquez sur « Regrouper les portraits analysés ».
              </p>
            )}
          </div>
        ) : (
          <p className="text-[12px] text-on-surface-variant">
            Ce module est désactivé par défaut pour respecter votre vie privée. Activez l'interrupteur ci-dessus uniquement si vous souhaitez organiser vos portraits localement par personne.
          </p>
        )}
      </section>


      {/* Interactive Map Widget (Real GPS Only) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-headline-md font-bold text-on-surface">Carte Géographique Réelle</h3>
            <p className="text-body-sm text-on-surface-variant">
              Seules les photos possédant de réelles coordonnées EXIF GPS sont affichées.
            </p>
          </div>
        </div>

        <div className="w-full h-80 rounded-2xl overflow-hidden shadow-md border border-outline-variant/30">
          <Suspense
            fallback={
              <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                Chargement de la carte...
              </div>
            }
          >
            <MapComponent photos={photos} />
          </Suspense>
        </div>
      </section>

      {/* Optional Cloud LLM Configuration (OpenRouter) with clear transparency */}
      <section className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowApiConfig(!showApiConfig)}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
            <h4 className="text-label-md font-bold text-on-surface">
              Modèles IA Cloud optionnels (OpenRouter)
            </h4>
          </div>
          <button className="text-on-surface-variant text-label-xs font-semibold hover:text-primary">
            {showApiConfig ? 'Masquer' : 'Configurer'}
          </button>
        </div>

        <p className="text-[11px] text-on-surface-variant">
          Aucun appel distant n'est requis pour faire fonctionner Photorapp. Si vous renseignez une clé OpenRouter, elle est stockée localement dans votre navigateur pour interroger des modèles de texte ou de métadonnées.
        </p>

        {showApiConfig && (
          <div className="space-y-3 pt-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Clé API OpenRouter (sk-or-...)"
              className="w-full h-10 px-4 rounded-xl bg-surface border border-outline-variant/40 text-body-sm outline-none focus:border-primary"
            />
            <button
              onClick={loadModels}
              disabled={loadingModels}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-semibold active:scale-95 disabled:opacity-50"
            >
              {loadingModels ? 'Vérification...' : 'Explorer les modèles gratuits (:free)'}
            </button>

            {models.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-surface rounded-xl border border-outline-variant/20 text-label-xs">
                {models.slice(0, 10).map((m) => (
                  <div key={m.id} className="p-2 border-b border-outline-variant/10">
                    <p className="font-bold text-primary">{m.name}</p>
                    <p className="text-on-surface-variant truncate">{m.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Review Modal: Blurry / Low Quality */}
      {activeReview === 'blurry' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Photos à examiner</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {lowQualityPhotos.length} photo(s) présentant un flou ou une anomalie d'exposition.
                </p>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-grow space-y-3 pr-1">
              {lowQualityPhotos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <PhotoThumbnail photo={p} className="w-16 h-16 shrink-0" />
                    <div>
                      <p className="text-body-sm font-bold text-on-surface truncate max-w-[200px]">
                        {p.alt || 'Photo'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">{p.date}</p>
                      <div className="flex gap-2 mt-1">
                        {p.metadata?.analysis?.isBlurry && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-semibold">
                            Floue (Score : {p.metadata.analysis.qualityScore}/100)
                          </span>
                        )}
                        {p.metadata?.analysis?.isUnderexposed && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-semibold">
                            Sous-exposée
                          </span>
                        )}
                        {p.metadata?.analysis?.isOverexposed && (
                          <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-md font-semibold">
                            Surexposée
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await deletePhoto(p.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-xl text-label-xs font-bold active:scale-95 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Supprimer</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveReview(null)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal: Duplicates */}
      {activeReview === 'duplicates' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Groupes de doublons</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Comparez les fichiers et supprimez manuellement ceux dont vous n'avez pas besoin.
                </p>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-grow space-y-4 pr-1">
              {allDuplicateGroups.map((group, gIdx) => (
                <div key={gIdx} className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex justify-between items-center text-label-sm font-bold text-primary">
                    <span>
                      Groupe {gIdx + 1} ({group.type === 'exact' ? 'Doublon exact SHA-256' : 'Images similaires'})
                    </span>
                    <span className="text-on-surface-variant font-normal text-label-xs">
                      {group.photos.length} photos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {group.photos.map((p) => (
                      <div key={p.id} className="p-2 bg-surface rounded-xl border border-outline-variant/20 space-y-2 flex flex-col">
                        <PhotoThumbnail photo={p} className="w-full aspect-square" />
                        <div className="text-[11px] space-y-0.5 flex-grow">
                          <p className="font-bold text-on-surface truncate">{p.alt}</p>
                          <p className="text-on-surface-variant">{p.date}</p>
                          {p.metadata?.fileSize && (
                            <p className="text-on-surface-variant">
                              {(p.metadata.fileSize / 1024).toFixed(0)} Ko
                            </p>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            await deletePhoto(p.id);
                          }}
                          className="w-full py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Supprimer cet exemplaire
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveReview(null)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceIA;
