import React, { useState } from 'react';
import { usePhotos } from '../context/usePhotos';
import type { Photo, PhotoAdjustments } from '../types/types';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import { exportSinglePhoto } from '../services/exportService';

interface EditorProps {
  photo: Photo;
  onClose: () => void;
}

const Editor: React.FC<EditorProps> = ({ photo, onClose }) => {
  const { updateAdjustments, resetAdjustments } = usePhotos();
  const url = usePhotoUrl(photo);

  const initialAdjustments: PhotoAdjustments = photo.adjustments || {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    vignette: 0,
    filter: '',
    rotation: 0,
    aspectRatio: 'original',
  };

  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(initialAdjustments);
  const [isComparing, setIsComparing] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'crop'>('adjust');

  const filters = [
    { name: 'Original', value: '' },
    { name: 'N&B', value: 'grayscale(100%)' },
    { name: 'Sépia', value: 'sepia(80%) contrast(110%)' },
    { name: 'HDR', value: 'contrast(125%) saturate(150%)' },
    { name: 'Froid', value: 'brightness(110%) hue-rotate(15deg)' },
    { name: 'Chaud', value: 'brightness(90%) hue-rotate(-20deg)' },
    { name: 'Dramatique', value: 'contrast(140%) brightness(90%) saturate(120%)' },
  ];

  const handleSliderChange = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterSelect = (filterValue: string) => {
    setAdjustments((prev) => ({ ...prev, filter: filterValue }));
  };

  const handleRotate = () => {
    setAdjustments((prev) => ({
      ...prev,
      rotation: ((prev.rotation || 0) + 90) % 360,
    }));
  };

  const handleAspectRatio = (ratio: PhotoAdjustments['aspectRatio']) => {
    setAdjustments((prev) => ({ ...prev, aspectRatio: ratio }));
  };

  const handleMagic = () => {
    setAdjustments((prev) => ({
      ...prev,
      brightness: 10,
      contrast: 20,
      saturation: 15,
      filter: prev.filter || 'contrast(110%) saturate(110%)',
    }));
  };

  const handleReset = () => {
    resetAdjustments(photo.id);
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0,
      vignette: 0,
      filter: '',
      rotation: 0,
      aspectRatio: 'original',
    });
  };

  const handleSave = () => {
    updateAdjustments(photo.id, adjustments);
    onClose();
  };

  const handleExportEdited = async () => {
    const tempPhoto: Photo = { ...photo, adjustments };
    await exportSinglePhoto(tempPhoto, true);
  };

  // Compute CSS filter string
  const brightness = 100 + (adjustments.brightness || 0);
  const contrast = 100 + (adjustments.contrast || 0);
  const saturation = 100 + (adjustments.saturation || 0);
  const filterStr = isComparing
    ? 'none'
    : `${adjustments.filter || ''} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`.trim();

  const photoStyle: React.CSSProperties = {
    filter: filterStr,
    transform: isComparing ? 'none' : `rotate(${adjustments.rotation || 0}deg)`,
  };

  const getAspectClass = () => {
    if (isComparing) return '';
    switch (adjustments.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
        return 'aspect-[16/9]';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 bg-black/60 backdrop-blur-md shrink-0 border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-label-sm font-semibold active:scale-95 select-none"
            title="Maintenez pour voir l'original"
          >
            <span className="material-symbols-outlined text-[16px]">compare</span>
            <span>{isComparing ? 'Original' : 'Comparer'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all"
            title="Réinitialiser les réglages"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </button>

          {/* Export Edited Copy */}
          <button
            onClick={handleExportEdited}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 text-white text-label-sm font-semibold hover:bg-white/30 active:scale-95"
            title="Exporter une copie avec les modifications"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span className="hidden sm:inline">Exporter</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="bg-primary text-on-primary px-5 py-1.5 rounded-full text-label-md font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            Enregistrer
          </button>
        </div>
      </header>

      {/* Canvas / Image Display */}
      <main className="flex-grow flex items-center justify-center p-4 min-h-0 relative select-none">
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${getAspectClass()}`}
        >
          <img
            src={url}
            alt={photo.alt}
            className="max-w-full max-h-full object-contain transition-all duration-200"
            style={photoStyle}
          />
        </div>
        {isComparing && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-label-sm font-bold border border-white/20">
            Original (non modifié)
          </div>
        )}
      </main>

      {/* Tab Selector */}
      <div className="bg-surface-container-highest/80 backdrop-blur-xl border-t border-outline-variant/20 flex justify-center gap-6 py-2 shrink-0">
        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-md font-semibold transition-all ${
            activeTab === 'adjust' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Ajustements
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-md font-semibold transition-all ${
            activeTab === 'filters' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">palette</span>
          Filtres
        </button>
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-md font-semibold transition-all ${
            activeTab === 'crop' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">crop</span>
          Recadrage
        </button>
      </div>

      {/* Workspace Area */}
      <div className="bg-surface/95 backdrop-blur-2xl border-t border-outline-variant/30 flex flex-col max-h-[45%] overflow-y-auto">
        {/* Quick Tools Header */}
        <div className="flex justify-around items-center py-3 border-b border-outline-variant/10 shrink-0">
          <button
            onClick={handleMagic}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary material-symbols-fill">auto_fix_high</span>
            <span className="text-[10px] font-bold text-on-surface">Magic AI</span>
          </button>
          <button
            onClick={handleRotate}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary">rotate_right</span>
            <span className="text-[10px] font-bold text-on-surface">Pivoter (+90°)</span>
          </button>
        </div>

        {/* Tab 1: Adjustments Sliders */}
        {activeTab === 'adjust' && (
          <div className="p-6 space-y-5 max-w-md mx-auto w-full">
            {[
              { label: 'Brightness', key: 'brightness', icon: 'brightness_6' },
              { label: 'Contrast', key: 'contrast', icon: 'contrast' },
              { label: 'Saturation', key: 'saturation', icon: 'palette' },
            ].map((item) => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex justify-between items-center text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">{item.icon}</span>
                    <span className="text-label-md font-semibold">{item.label}</span>
                  </div>
                  <span className="text-label-md font-bold text-primary">
                    {(adjustments[item.key as keyof PhotoAdjustments] as number) || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  aria-label={item.label}
                  value={(adjustments[item.key as keyof PhotoAdjustments] as number) || 0}
                  onChange={(e) =>
                    handleSliderChange(item.key as keyof PhotoAdjustments, parseInt(e.target.value, 10))
                  }
                  className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Filters */}
        {activeTab === 'filters' && (
          <div className="p-6">
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {filters.map((f) => (
                <button
                  key={f.name}
                  onClick={() => handleFilterSelect(f.value)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group"
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden border-2 transition-all ${
                      adjustments.filter === f.value ? 'border-primary shadow-lg scale-105' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      style={{ filter: f.value }}
                      alt={f.name}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      adjustments.filter === f.value ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Crop and Ratios */}
        {activeTab === 'crop' && (
          <div className="p-6 space-y-4 max-w-md mx-auto w-full">
            <p className="text-label-sm font-semibold text-on-surface-variant text-center">
              Sélectionnez un ratio de recadrage d'affichage :
            </p>
            <div className="grid grid-cols-4 gap-3">
              {(['original', '1:1', '4:3', '16:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => handleAspectRatio(ratio)}
                  className={`py-3 px-2 rounded-xl text-label-md font-bold text-center border-2 transition-all active:scale-95 ${
                    adjustments.aspectRatio === ratio
                      ? 'border-primary bg-primary-container/30 text-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {ratio === 'original' ? 'Original' : ratio}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
