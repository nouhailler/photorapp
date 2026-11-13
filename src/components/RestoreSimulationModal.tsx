import React from 'react';
import type { RestoreSimulationResult } from '../services/exportService';

interface RestoreSimulationModalProps {
  simulation: RestoreSimulationResult | null;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring: boolean;
}

export const RestoreSimulationModal: React.FC<RestoreSimulationModalProps> = ({
  simulation,
  fileName,
  onConfirm,
  onCancel,
  isRestoring,
}) => {
  if (!simulation) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              simulation.valid
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <span className="material-symbols-outlined text-[28px]">
              {simulation.valid ? 'verified_user' : 'warning'}
            </span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              Prévisualisation de la Restauration
            </h3>
            <p className="text-[12px] text-on-surface-variant truncate max-w-xs">{fileName}</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
              <span className="block text-headline-sm font-bold text-primary">
                {simulation.totalPhotosInArchive}
              </span>
              <span className="text-[11px] text-on-surface-variant">Photos dans l'archive</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
              <span className="block text-headline-sm font-bold text-on-surface">
                {simulation.totalAlbumsInArchive}
              </span>
              <span className="text-[11px] text-on-surface-variant">Albums inclus</span>
            </div>
          </div>

          <div className="space-y-1.5 text-body-sm text-on-surface-variant pt-1 text-[13px]">
            <div className="flex justify-between">
              <span>Nouvelles photos à ajouter :</span>
              <strong className="text-emerald-600 font-bold">{simulation.newPhotosCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Photos déjà présentes (préservées) :</span>
              <strong className="text-on-surface font-semibold">{simulation.alreadyPresentCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Originaux stockés localement :</span>
              <strong className="text-on-surface font-semibold">{simulation.localFilesCount}</strong>
            </div>
            {simulation.archiveDate && (
              <div className="flex justify-between">
                <span>Date de la sauvegarde :</span>
                <span className="text-on-surface font-medium">
                  {new Date(simulation.archiveDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Warnings & Errors */}
          {simulation.warnings.length > 0 && (
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-700 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Avertissements ({simulation.warnings.length})
              </p>
              {simulation.warnings.slice(0, 3).map((w, idx) => (
                <p key={idx}>• {w}</p>
              ))}
            </div>
          )}

          {simulation.errors.length > 0 && (
            <div className="p-2.5 bg-error/10 rounded-xl border border-error/20 text-[11px] text-error space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                Anomalies détectées ({simulation.errors.length})
              </p>
              {simulation.errors.slice(0, 3).map((err, idx) => (
                <p key={idx}>• {err}</p>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isRestoring}
            className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-variant/40 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isRestoring || !simulation.valid}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isRestoring ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                <span>Restauration en cours...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download_done</span>
                <span>Confirmer et Restaurer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
