import React, { useState, useRef } from 'react';
import { EDITORIAL_PHOTOS } from './landingMedia';

const EDITOR_PRESETS = [
  { id: 'original', label: 'Original', filterCss: 'none', summary: 'Image brute non modifiée' },
  {
    id: 'vivid',
    label: 'Vivid',
    filterCss: 'saturate(135%) contrast(108%)',
    summary: 'Saturation +35 % · Contraste +8 %',
  },
  {
    id: 'bw',
    label: 'Noir et blanc',
    filterCss: 'grayscale(100%) contrast(115%)',
    summary: 'Monochrome · Contraste +15 %',
  },
  {
    id: 'cinema',
    label: 'Cinéma',
    filterCss: 'contrast(112%) saturate(90%) sepia(18%)',
    summary: 'Contraste +12 % · Ton chaud subtil',
  },
];

export const DemoPhotoEditor: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(52);
  const [selectedPreset, setSelectedPreset] = useState<string>('vivid');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const activePreset = EDITOR_PRESETS.find((p) => p.id === selectedPreset) || EDITOR_PRESETS[1];

  const updateSliderFromClientX = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.round(Math.min(95, Math.max(5, pct)));
    setSliderPosition(clamped);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateSliderFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <div id="demo-retouche" className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Colonne gauche : comparateur Avant / Après tactile et clavier */}
        <div className="lg:col-span-7 space-y-4">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 aspect-[4/3] bg-neutral-900 select-none touch-none cursor-ew-resize"
          >
            {/* Image Retouchée (arrière-plan) */}
            <img
              src={EDITORIAL_PHOTOS.alpineLake.src}
              alt="Aperçu démonstration de filtre appliqué sans modifier l'original"
              width={800}
              height={600}
              loading="lazy"
              draggable={false}
              style={{ filter: activePreset.filterCss }}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Image Originale superposée selon sliderPosition */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={EDITORIAL_PHOTOS.alpineLake.src}
                alt="Image originale intacte avant retouche"
                width={800}
                height={600}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Ligne de séparation et poignée */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 w-0.5 bg-white shadow pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-[#18191D] shadow-lg border border-neutral-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              </div>
            </div>

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/75 text-white text-[11px] font-medium pointer-events-none">
              Original intact
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/75 text-white text-[11px] font-medium pointer-events-none">
              Prévisualisation ({activePreset.label})
            </div>
          </div>

          {/* Barre de contrôle interactive accessible */}
          <div className="bg-[#FAF9F6] rounded-xl border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Préréglages de filtre">
              {EDITOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={selectedPreset === preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] ${
                    selectedPreset === preset.id
                      ? 'bg-[#18191D] text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 text-xs font-medium text-neutral-700 shrink-0">
              <span>Comparer</span>
              <input
                type="range"
                min={5}
                max={95}
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                aria-label="Curseur de comparaison avant/après"
                className="w-32 sm:w-36 accent-[#1E35D0] cursor-pointer"
              />
              <span className="font-mono text-[11px] text-neutral-500 tabular-nums w-8 text-right">
                {sliderPosition}%
              </span>
            </label>
          </div>
        </div>

        {/* Colonne droite : explication produit + transparence technique */}
        <div className="lg:col-span-5 space-y-4">
          <span className="font-mono text-xs font-semibold text-[#1E35D0]">
            03. Retouche non destructive · Aperçu interactif
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug">
            Glissez le curseur : votre fichier original reste intact
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Dans Gallery Pro, vos réglages (luminosité, contraste, saturation, exposition, température, teinte,
            vignettage, filtres créatifs, rotation et recadrage) sont enregistrés sous forme de paramètres JSON séparés.
            Vous pouvez revenir à l&apos;image d&apos;origine à tout moment.
          </p>

          <div className="bg-[#F2F1EC] rounded-xl p-4 space-y-1.5 text-xs">
            <div className="font-semibold text-[#18191D]">Préréglage actif : {activePreset.label}</div>
            <p className="font-mono text-neutral-700 tabular-nums">{activePreset.summary}</p>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Illustration visuelle par filtres CSS : lors d&apos;un export JPEG réel depuis l&apos;application, le rendu
            est calculé côté navigateur sur Canvas (<code className="font-mono">exportService.ts</code>), où certains
            réglages (hautes lumières/ombres mémorisées et teinte CSS) ont un rendu distinct de l&apos;aperçu écran.
          </p>
        </div>
      </div>
    </div>
  );
};
