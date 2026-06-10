import React, { useState } from 'react';
import { usePhotos } from '../context/PhotoContext';
import type { Photo, PhotoAdjustments } from '../types/types';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

interface EditorProps {
  photo: Photo;
  onClose: () => void;
}

const Editor: React.FC<EditorProps> = ({ photo, onClose }) => {
  const { updateAdjustments } = usePhotos();
  const url = usePhotoUrl(photo);
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(
    photo.adjustments || { brightness: 0, contrast: 0, saturation: 0, filter: '', rotation: 0 }
  );

  const filters = [
    { name: 'Original', value: '' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Vintage', value: 'sepia(80%) contrast(110%)' },
    { name: 'HDR', value: 'contrast(125%) saturate(150%)' },
    { name: 'Cool', value: 'brightness(110%) hue-rotate(15deg)' },
    { name: 'Warm', value: 'brightness(90%) hue-rotate(-20deg)' },
  ];

  const handleSliderChange = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterSelect = (filterValue: string) => {
    setAdjustments(prev => ({ ...prev, filter: filterValue }));
  };

  const handleRotate = () => {
    setAdjustments(prev => ({ ...prev, rotation: ((prev.rotation || 0) + 90) % 360 }));
  };

  const handleMagic = () => {
    setAdjustments(prev => ({
      ...prev,
      brightness: 10,
      contrast: 20,
      saturation: 15,
      filter: prev.filter || 'contrast(110%) saturate(110%)'
    }));
  };

  const handleSave = () => {
    updateAdjustments(photo.id, adjustments);
    onClose();
  };

  const photoStyle = {
    filter: `${adjustments.filter || ''} brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%) saturate(${100 + adjustments.saturation}%)`,
    transform: `rotate(${adjustments.rotation || 0}deg)`,
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-md">
        <button onClick={onClose} className="p-2 text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
        <button onClick={handleSave} className="bg-primary text-on-primary px-6 py-1.5 rounded-full text-label-md font-bold">
          Done
        </button>
      </header>

      {/* Canvas */}
      <main className="flex-grow flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={url} 
            alt={photo.alt} 
            className="max-w-full max-h-full object-contain transition-all duration-300"
            style={photoStyle}
          />
        </div>
      </main>

      {/* Adjustments Workspace */}
      <div className="bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 overflow-hidden flex flex-col">
        {/* Quick Tools Row (Magic, Crop, Rotate) */}
        <div className="flex justify-around items-center py-4 border-b border-outline-variant/10">
          <button 
            onClick={handleMagic}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary material-symbols-fill">auto_fix_high</span>
            <span className="text-[10px] font-bold text-on-surface">Magic</span>
          </button>
          <button 
            onClick={() => alert('Recadrage bientôt disponible !')}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface-variant">crop</span>
            <span className="text-[10px] font-bold text-on-surface-variant">Crop</span>
          </button>
          <button 
            onClick={handleRotate}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary">rotate_right</span>
            <span className="text-[10px] font-bold text-on-surface">Rotate</span>
          </button>
        </div>

        {/* Filters Scroll */}
        <div className="w-full border-b border-outline-variant/20 py-4">
          <div className="flex gap-4 px-6 overflow-x-auto hide-scrollbar">
            {filters.map((f) => (
              <button 
                key={f.name}
                onClick={() => handleFilterSelect(f.value)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className={`w-14 h-14 rounded-lg bg-surface-container-high overflow-hidden border-2 ${adjustments.filter === f.value ? 'border-primary' : 'border-transparent'}`}>
                  <img src={url} className="w-full h-full object-cover" style={{ filter: f.value }} alt={f.name} />
                </div>
                <span className={`text-[10px] font-medium ${adjustments.filter === f.value ? 'text-primary' : 'text-on-surface-variant'}`}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-md mx-auto w-full">
          {[
            { label: 'Brightness', key: 'brightness', icon: 'brightness_6' },
            { label: 'Contrast', key: 'contrast', icon: 'contrast' },
            { label: 'Saturation', key: 'saturation', icon: 'palette' },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex justify-between items-center text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-label-md font-semibold">{item.label}</span>
                </div>
                <span className="text-label-md font-bold text-primary">{adjustments[item.key as keyof PhotoAdjustments]}</span>
              </div>
              <input 
                type="range" 
                min="-100" 
                max="100" 
                value={adjustments[item.key as keyof PhotoAdjustments] as number}
                onChange={(e) => handleSliderChange(item.key as keyof PhotoAdjustments, parseInt(e.target.value))}
                className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Editor;
