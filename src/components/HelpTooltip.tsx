import React, { useState, useRef, useEffect } from 'react';
import { useHelp } from '../context/useHelp';

interface HelpTooltipProps {
  text: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  text,
  title,
  position = 'top',
  className = '',
}) => {
  const { isHelpModeActive } = useHelp();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!isVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  // Masquer l'infobulle si le mode débutant est désactivé
  if (!isHelpModeActive) return null;

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }[position];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        className="w-4 h-4 rounded-full bg-primary/15 hover:bg-primary/30 text-primary flex items-center justify-center transition-all cursor-pointer select-none active:scale-90"
        title="Cliquez pour afficher l'aide pour débutant"
        aria-label="Aide contextuelle"
      >
        <span className="text-[10px] font-bold leading-none">?</span>
      </button>

      {isVisible && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-[150] w-64 p-3 bg-surface border border-outline-variant/40 rounded-2xl shadow-xl backdrop-blur-xl animate-in fade-in duration-150 text-left pointer-events-auto ${positionClasses}`}
        >
          {title && (
            <p className="text-label-xs font-bold text-primary mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              {title}
            </p>
          )}
          <p className="text-[12px] leading-relaxed text-on-surface-variant font-medium">
            {text}
          </p>
        </div>
      )}
    </div>
  );
};
