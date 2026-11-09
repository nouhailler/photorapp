import React from 'react';
import type { ImportProgress, ImportResult } from '../services/importService';

interface ImportModalProps {
  isOpen: boolean;
  progress: ImportProgress | null;
  result: ImportResult | null;
  isProcessing: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  progress,
  result,
  isProcessing,
  onClose,
}) => {
  if (!isOpen) return null;

  const percent = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">
                {isProcessing ? 'sync' : 'check_circle'}
              </span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {isProcessing ? 'Importation en cours...' : 'Importation terminée'}
              </h3>
              <p className="text-label-sm text-on-surface-variant">
                {isProcessing ? 'Traitement local & extraction EXIF' : 'Résultat de l\'opération'}
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && progress && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-label-sm font-semibold text-on-surface">
              <span className="truncate max-w-[240px]">{progress.fileName || 'Préparation...'}</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant italic text-center">
              {progress.phase === 'reading' && 'Lecture du fichier...'}
              {progress.phase === 'hashing' && 'Calcul de l\'empreinte SHA-256...'}
              {progress.phase === 'exif' && 'Extraction métadonnées EXIF & GPS...'}
              {progress.phase === 'saving' && 'Enregistrement dans IndexedDB...'}
            </p>
          </div>
        )}

        {/* Completed State */}
        {!isProcessing && result && (
          <div className="space-y-3 pt-2">
            <div className="p-4 bg-surface-container-low rounded-2xl space-y-2 border border-outline-variant/20">
              <div className="flex items-center justify-between text-body-sm font-medium">
                <span className="text-on-surface">Photos importées :</span>
                <span className="font-bold text-primary">{result.importedPhotos.length}</span>
              </div>
              {result.skippedDuplicates > 0 && (
                <div className="flex items-center justify-between text-body-sm font-medium">
                  <span className="text-on-surface-variant">Doublons identiques ignorés :</span>
                  <span className="font-bold text-amber-500">{result.skippedDuplicates}</span>
                </div>
              )}
              {result.failedFiles.length > 0 && (
                <div className="flex items-center justify-between text-body-sm font-medium">
                  <span className="text-error">Fichiers en échec :</span>
                  <span className="font-bold text-error">{result.failedFiles.length}</span>
                </div>
              )}
            </div>

            {result.failedFiles.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-error-container/20 rounded-xl text-[11px] text-error">
                {result.failedFiles.map((f, i) => (
                  <p key={i}>• {f.name} : {f.reason}</p>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-label-md active:scale-95 transition-transform"
            >
              Terminer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
