import React, { useState } from 'react';
import { usePhotos } from '../context/usePhotos';
import type { Photo, PhotoAdjustments } from '../types/types';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import { exportSinglePhoto } from '../services/exportService';
import { HelpTooltip } from './HelpTooltip';

interface EditorProps {
  photo: Photo;
  onClose: () => void;
}

interface CropMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
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

  // Derive initial crop margins from photo.adjustments.cropRect if present
  const getInitialCropMargins = (): CropMargins => {
    if (photo.adjustments?.cropRect) {
      const imgW = photo.metadata?.width || 1200;
      const imgH = photo.metadata?.height || 800;
      const { x, y, width, height } = photo.adjustments.cropRect;
      return {
        left: Math.max(0, Math.min(45, Math.round((x / imgW) * 100))),
        top: Math.max(0, Math.min(45, Math.round((y / imgH) * 100))),
        right: Math.max(0, Math.min(45, Math.round(((imgW - (x + width)) / imgW) * 100))),
        bottom: Math.max(0, Math.min(45, Math.round(((imgH - (y + height)) / imgH) * 100))),
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  };

  const [cropMargins, setCropMargins] = useState<CropMargins>(getInitialCropMargins);

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

  const handleAutoAdjust = () => {
    setAdjustments((prev) => ({
      ...prev,
      brightness: 10,
      contrast: 20,
      saturation: 15,
      exposure: 5,
      highlights: -10,
      shadows: 15,
      filter: prev.filter || 'contrast(110%) saturate(110%)',
    }));
  };

  const handleCropMarginChange = (side: keyof CropMargins, val: number) => {
    const nextMargins = { ...cropMargins, [side]: Math.max(0, Math.min(45, val)) };
    setCropMargins(nextMargins);

    const imgW = photo.metadata?.width || 1200;
    const imgH = photo.metadata?.height || 800;
    const x = Math.round((nextMargins.left / 100) * imgW);
    const y = Math.round((nextMargins.top / 100) * imgH);
    const w = Math.max(10, Math.round(imgW - x - (nextMargins.right / 100) * imgW));
    const h = Math.max(10, Math.round(imgH - y - (nextMargins.bottom / 100) * imgH));

    setAdjustments((prev) => ({
      ...prev,
      cropRect: (nextMargins.top > 0 || nextMargins.bottom > 0 || nextMargins.left > 0 || nextMargins.right > 0)
        ? { x, y, width: w, height: h }
        : undefined,
    }));
  };

  const handleResetCrop = () => {
    setCropMargins({ top: 0, right: 0, bottom: 0, left: 0 });
    setAdjustments((prev) => ({
      ...prev,
      aspectRatio: 'original',
      cropRect: undefined,
    }));
  };

  const handleReset = () => {
    resetAdjustments(photo.id);
    setCropMargins({ top: 0, right: 0, bottom: 0, left: 0 });
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
      cropRect: undefined,
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
  const brightness = 100 + (adjustments.brightness || 0) + (adjustments.exposure || 0);
  const contrast = 100 + (adjustments.contrast || 0);
  const saturation = 100 + (adjustments.saturation || 0);

  let tempFilter = '';
  if (adjustments.temperature && adjustments.temperature !== 0) {
    tempFilter = adjustments.temperature > 0
      ? `sepia(${Math.min(50, adjustments.temperature / 2)}%)`
      : `hue-rotate(${adjustments.temperature * 0.3}deg)`;
  }

  let tintFilter = '';
  if (adjustments.tint && adjustments.tint !== 0) {
    tintFilter = `hue-rotate(${adjustments.tint * 0.3}deg)`;
  }

  const filterStr = isComparing
    ? 'none'
    : `${adjustments.filter || ''} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${tempFilter} ${tintFilter}`.trim();

  const isCropped =
    cropMargins.top > 0 || cropMargins.right > 0 || cropMargins.bottom > 0 || cropMargins.left > 0;

  const photoStyle: React.CSSProperties = {
    filter: filterStr,
    transform: isComparing ? 'none' : `rotate(${adjustments.rotation || 0}deg)`,
    clipPath: (!isComparing && isCropped)
      ? `inset(${cropMargins.top}% ${cropMargins.right}% ${cropMargins.bottom}% ${cropMargins.left}%)`
      : 'none',
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
          aria-label="Fermer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <div className="flex items-center gap-1">
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
            <HelpTooltip text="Maintenez ce bouton enfoncé pour afficher la photo brute originale sans aucun filtre ni retouche." />
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all"
            title="Réinitialiser tous les réglages"
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

          {/* Vignette Preview Overlay */}
          {!isComparing && (adjustments.vignette || 0) > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${Math.min(0.9, (adjustments.vignette || 0) / 100)}) 100%)`,
              }}
            />
          )}
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAutoAdjust}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
              title="Optimisation automatique des couleurs et de la lumière"
            >
              <span className="material-symbols-outlined text-primary material-symbols-fill">auto_fix_high</span>
              <span className="text-[10px] font-bold text-on-surface">Auto-Ajustement</span>
            </button>
            <HelpTooltip text="Applique un équilibrage automatique doux du contraste, de l'exposition et de la saturation pour embellir instantanément la photo." />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRotate}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-primary">rotate_right</span>
              <span className="text-[10px] font-bold text-on-surface">Pivoter (+90°)</span>
            </button>
            <HelpTooltip text="Fait tourner la photo d'un quart de tour dans le sens horaire." />
          </div>
        </div>

        {/* Tab 1: Adjustments Sliders */}
        {activeTab === 'adjust' && (
          <div className="p-6 space-y-5 max-w-md mx-auto w-full">
            {[
              { label: 'Luminosité', key: 'brightness', icon: 'brightness_6', min: -100, max: 100, desc: "Ajuste la clarté générale de l'image." },
              { label: 'Contraste', key: 'contrast', icon: 'contrast', min: -100, max: 100, desc: 'Renforce ou adoucit la différence entre zones claires et sombres.' },
              { label: 'Saturation', key: 'saturation', icon: 'palette', min: -100, max: 100, desc: "Rend les couleurs plus vives ou plus sobres (jusqu'au noir et blanc)." },
              { label: 'Exposition', key: 'exposure', icon: 'wb_sunny', min: -100, max: 100, desc: 'Simule un apport lumineux plus ou moins intense du capteur.' },
              { label: 'Température', key: 'temperature', icon: 'thermostat', min: -100, max: 100, desc: 'Réchauffe (tons ambrés) ou refroidit (tons bleutés) la tonalité.' },
              { label: 'Teinte', key: 'tint', icon: 'color_lens', min: -100, max: 100, desc: 'Bascule la balance des teintes entre nuances vertes et magenta.' },
              { label: 'Hautes Lumières', key: 'highlights', icon: 'light_mode', min: -100, max: 100, desc: 'Recouvre des détails dans le ciel ou les zones très claires.' },
              { label: 'Ombres', key: 'shadows', icon: 'dark_mode', min: -100, max: 100, desc: 'Éclaircit les sous-bois ou zones ombragées pour révéler les détails.' },
              { label: 'Vignettage', key: 'vignette', icon: 'vignette', min: 0, max: 100, desc: 'Crée un halo sombre subtil sur le pourtour pour concentrer l’œil.' },
            ].map((item) => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex justify-between items-center text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">{item.icon}</span>
                    <span className="text-label-md font-semibold">{item.label}</span>
                    <HelpTooltip text={item.desc} />
                  </div>
                  <span className="text-label-md font-bold text-primary">
                    {(adjustments[item.key as keyof PhotoAdjustments] as number) || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
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
          <div className="p-6 space-y-6 max-w-md mx-auto w-full">
            <div>
              <p className="text-label-sm font-semibold text-on-surface-variant text-center mb-3">
                Format et proportions d'affichage :
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

            {/* Custom Crop Margins */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-label-sm font-bold text-on-surface">Rognage personnalisé (% de marge)</span>
                <button
                  onClick={handleResetCrop}
                  className="text-primary text-[11px] font-bold hover:underline"
                >
                  Réinitialiser le recadrage
                </button>
              </div>

              {[
                { label: 'Haut', side: 'top' as const },
                { label: 'Bas', side: 'bottom' as const },
                { label: 'Gauche', side: 'left' as const },
                { label: 'Droite', side: 'right' as const },
              ].map(({ label, side }) => (
                <div key={side} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-semibold text-on-surface-variant">
                    <span>{label}</span>
                    <span className="text-primary font-bold">{cropMargins[side]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    aria-label={`Rognage ${label}`}
                    value={cropMargins[side]}
                    onChange={(e) => handleCropMarginChange(side, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
