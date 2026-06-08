import React, { useState } from 'react';
import { usePhotos } from '../context/PhotoContext';
import type { Photo, PhotoAdjustments } from '../types/types';

interface EditorProps {
  photo: Photo;
  onClose: () => void;
}

const Editor: React.FC<EditorProps> = ({ photo, onClose }) => {
  const { updateAdjustments } = usePhotos();
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(
    photo.adjustments || { brightness: 0, contrast: 0, saturation: 0 }
  );

  const handleSliderChange = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateAdjustments(photo.id, adjustments);
    onClose();
  };

  const photoStyle = {
    filter: `brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%) saturate(${100 + adjustments.saturation}%)`,
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
        <img 
          src={photo.url} 
          alt={photo.alt} 
          className="max-w-full max-h-full object-contain transition-all duration-300"
          style={photoStyle}
        />
      </main>

      {/* Adjustments Workspace */}
      <div className="bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 p-6 space-y-6">
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
              value={adjustments[item.key as keyof PhotoAdjustments]}
              onChange={(e) => handleSliderChange(item.key as keyof PhotoAdjustments, parseInt(e.target.value))}
              className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        ))}

        {/* AI Magic Quick Tools */}
        <div className="flex justify-around items-center pt-4 border-t border-outline-variant/20">
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined">auto_fix_high</span>
            <span className="text-label-sm font-medium">Magic</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">crop</span>
            <span className="text-label-sm font-medium">Crop</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">rotate_right</span>
            <span className="text-label-sm font-medium">Rotate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
