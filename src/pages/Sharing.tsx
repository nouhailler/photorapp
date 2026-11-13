import React, { useRef, useState, useEffect } from 'react';
import { usePhotos } from '../context/usePhotos';
import { processPhotosImport } from '../services/importService';
import type { ImportProgress, ImportResult } from '../services/importService';
import { ImportModal } from '../components/ImportModal';
import {
  exportPhotosToZip,
  exportMetadataJson,
  createFullLibraryBackup,
  restoreFullLibraryBackup,
  simulateRestoreBackup,
} from '../services/exportService';
import type { BackupResult, RestoreResult, ZipExportResult, RestoreSimulationResult } from '../services/exportService';
import { RestoreSimulationModal } from '../components/RestoreSimulationModal';
import { regenerateAllMissingThumbnails } from '../services/thumbnailService';
import { diagnoseStorage, cleanupOrphanedBlobs } from '../utils/db';
import type { StorageDiagnostic } from '../types/types';
import { HelpTooltip } from '../components/HelpTooltip';

const Sharing: React.FC = () => {
  const { photos, albums, addPhotos } = usePhotos();

  // Import Ref & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Backup & Export status
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportProgressPct, setExportProgressPct] = useState(0);

  // Restore Simulation
  const [restoreSimulation, setRestoreSimulation] = useState<RestoreSimulationResult | null>(null);
  const [restorePendingFile, setRestorePendingFile] = useState<File | null>(null);

  // Detailed Operation Reports
  const [backupReport, setBackupReport] = useState<BackupResult | null>(null);
  const [restoreReport, setRestoreReport] = useState<RestoreResult | null>(null);
  const [zipExportReport, setZipExportReport] = useState<ZipExportResult | null>(null);

  // Diagnostics
  const [diagnostic, setDiagnostic] = useState<StorageDiagnostic | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [isRegeneratingThumbs, setIsRegeneratingThumbs] = useState(false);


  const loadDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      const diag = await diagnoseStorage(photos, albums);
      setDiagnostic(diag);
    } catch (e) {
      console.warn('Diagnostic error:', e);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    diagnoseStorage(photos, albums).then((diag) => {
      if (isMounted) setDiagnostic(diag);
    });
    return () => {
      isMounted = false;
    };
  }, [photos, albums]);

  // Import handler using centralized service
  const handleImportFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImport(true);
    setShowImportModal(true);
    setImportResult(null);

    try {
      const result = await processPhotosImport(files, photos, (prog) => {
        setImportProgress(prog);
      });

      if (result.importedPhotos.length > 0) {
        await addPhotos(result.importedPhotos.map((p) => ({ photo: p })));
      }
      setImportResult(result);
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      setIsProcessingImport(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDiagnostic();
    }
  };

  // Full Library Backup
  const handleBackupLibrary = async () => {
    if (photos.length === 0) return;
    setIsExporting(true);
    setExportProgressPct(5);
    setExportStatusText('Préparation de la sauvegarde...');

    try {
      const res = await createFullLibraryBackup(photos, albums, (pct, status) => {
        setExportProgressPct(pct);
        setExportStatusText(status);
      });
      setBackupReport(res);
    } catch (err) {
      console.error('Backup error:', err);
    } finally {
      setIsExporting(false);
      setExportStatusText('');
    }
  };

  // Full Library Restore Simulation Trigger
  const handleRestoreLibrary = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExporting(true);
    setExportProgressPct(20);
    setExportStatusText("Analyse et simulation de l'archive de sauvegarde...");

    try {
      const sim = await simulateRestoreBackup(file);
      setRestoreSimulation(sim);
      setRestorePendingFile(file);
    } catch (err) {
      console.error('Simulation restore error:', err);
      alert(`Erreur de lecture de l'archive : ${err instanceof Error ? err.message : 'Fichier non valide'}`);
    } finally {
      setIsExporting(false);
      setExportStatusText('');
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };

  // Confirmed Full Library Restore Execution
  const handleConfirmRestore = async () => {
    if (!restorePendingFile) return;

    setIsExporting(true);
    setExportProgressPct(10);
    setExportStatusText('Restauration sécurisée en cours...');

    try {
      const res = await restoreFullLibraryBackup(restorePendingFile, (pct, status) => {
        setExportProgressPct(pct);
        setExportStatusText(status);
      });
      setRestoreReport(res);
      setRestoreSimulation(null);
      setRestorePendingFile(null);
      loadDiagnostic();
    } catch (err) {
      console.error('Restore error:', err);
      alert(`Erreur lors de la restauration : ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsExporting(false);
      setExportStatusText('');
    }
  };

  // Regenerate missing thumbnails
  const handleRegenerateThumbnails = async () => {
    setIsRegeneratingThumbs(true);
    try {
      const res = await regenerateAllMissingThumbnails(photos);
      setCleanupMessage(`${res.generated} miniature(s) générée(s) avec succès.`);
      setTimeout(() => setCleanupMessage(''), 3000);
      loadDiagnostic();
    } catch (err) {
      console.error('Thumbnails regeneration error:', err);
    } finally {
      setIsRegeneratingThumbs(false);
    }
  };


  // Export All ZIP
  const handleExportAllZip = async () => {
    if (photos.length === 0) return;
    setIsExporting(true);
    setExportProgressPct(10);
    setExportStatusText('Compression de toutes les photos...');
    try {
      const res = await exportPhotosToZip(photos, 'photorapp_toutes_photos.zip', (pct, name) => {
        setExportProgressPct(pct);
        setExportStatusText(`Ajout : ${name}`);
      });
      setZipExportReport(res);
    } catch (e) {
      console.error('Zip export error:', e);
    } finally {
      setIsExporting(false);
      setExportStatusText('');
    }
  };

  // Export Metadata JSON
  const handleExportMetadata = () => {
    exportMetadataJson(photos, albums);
  };

  // Cleanup orphaned blobs
  const handleCleanupOrphans = async () => {
    const activeIds = photos.map((p) => p.id);
    const removed = await cleanupOrphanedBlobs(activeIds);
    setCleanupMessage(`${removed} fichier(s) orphelin(s) supprimé(s) avec succès.`);
    setTimeout(() => setCleanupMessage(''), 3000);
    loadDiagnostic();
  };

  return (
    <div className="px-container-padding space-y-section-margin max-w-5xl mx-auto pb-28">
      {/* Hidden File Inputs */}
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImportFiles}
      />
      <input
        type="file"
        accept=".zip"
        className="hidden"
        ref={restoreInputRef}
        onChange={handleRestoreLibrary}
      />

      {/* Header */}
      <section className="pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-lg font-bold text-on-surface">Sauvegarde & Exportation</h2>
          <HelpTooltip text="Gallery Pro fonctionne 100% en local dans votre navigateur. Utilisez cette page pour exporter des sauvegardes sécurisées sur votre disque dur ou restaurer vos albums." />
        </div>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Centre de gestion des transferts, sauvegardes intégrales et santé de votre stockage local.
        </p>
      </section>

      {/* Progress banner for Backup/Export */}
      {isExporting && (
        <div className="p-4 bg-primary-container/30 border border-primary/40 rounded-2xl space-y-2 animate-in fade-in">
          <div className="flex justify-between text-label-sm font-bold text-primary">
            <span>{exportStatusText}</span>
            <span>{exportProgressPct}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${exportProgressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Import Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">
            Importer des photos
          </h3>
          <HelpTooltip text="Sélectionnez des fichiers photo depuis votre ordinateur ou smartphone. Vos photos restent sur votre appareil et ne sont jamais transmises à des tiers." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm group active:scale-95 transition-all text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <div>
              <p className="text-headline-sm font-bold text-on-surface">Importer depuis cet appareil</p>
              <p className="text-label-xs text-on-surface-variant mt-0.5">
                Sélectionnez des photos (JPEG, PNG, WEBP, AVIF, HEIC). Extraction automatique des EXIF et GPS.
              </p>
            </div>
          </button>

          <button
            onClick={() => restoreInputRef.current?.click()}
            className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm group active:scale-95 transition-all text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-tertiary-container flex items-center justify-center text-on-tertiary-container shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl">settings_backup_restore</span>
            </div>
            <div>
              <p className="text-headline-sm font-bold text-on-surface">Restaurer une sauvegarde (.zip)</p>
              <p className="text-label-xs text-on-surface-variant mt-0.5">
                Réinjectez une archive complète exportée depuis Gallery Pro avec vérification d'intégrité.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Export Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">
            Sauvegarde & Archives
          </h3>
          <HelpTooltip text="Sauvegardez l'ensemble de votre bibliothèque dans un fichier zip sécurisé avec un manifeste certifié SHA-256." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Backup Full Library */}
          <div
            onClick={handleBackupLibrary}
            className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm group cursor-pointer active:scale-95 transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">archive</span>
            </div>
            <div>
              <h4 className="text-label-lg font-bold text-on-surface">Sauvegarde intégrale (.zip)</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Génère une archive avec manifeste versionné v2, empreintes SHA-256 et métadonnées.
              </p>
            </div>
            <span className="text-label-xs font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Télécharger l'archive <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>

          {/* Export All Photos as ZIP */}
          <div
            onClick={handleExportAllZip}
            className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm group cursor-pointer active:scale-95 transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">folder_zip</span>
            </div>
            <div>
              <h4 className="text-label-lg font-bold text-on-surface">Exporter les photos en ZIP</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Archive simple comprenant vos photos avec leurs réglages et recadrages appliqués.
              </p>
            </div>
            <span className="text-label-xs font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Exporter {photos.length} photos <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>

          {/* Export Metadata JSON */}
          <div
            onClick={handleExportMetadata}
            className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm group cursor-pointer active:scale-95 transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">data_object</span>
            </div>
            <div>
              <h4 className="text-label-lg font-bold text-on-surface">Catalogue JSON</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Fichier de métadonnées structurées (albums, tags, EXIF, dates) au format standard JSON.
              </p>
            </div>
            <span className="text-label-xs font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Télécharger JSON <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </section>

      {/* Storage Diagnostics and Local Health */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">
            Diagnostic du Stockage Local (IndexedDB)
          </h3>
          <button
            onClick={loadDiagnostic}
            disabled={diagnosticLoading}
            className="text-label-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Actualiser</span>
          </button>
        </div>

        {cleanupMessage && (
          <div className="p-3 bg-tertiary-container/40 text-on-tertiary-container rounded-xl text-label-sm font-semibold animate-in fade-in">
            {cleanupMessage}
          </div>
        )}

        {diagnostic && (
          <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="block text-headline-sm font-bold text-primary">{diagnostic.totalPhotos}</span>
                <span className="text-[11px] text-on-surface-variant">Photos au catalogue</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="block text-headline-sm font-bold text-on-surface">{diagnostic.localPhotosCount}</span>
                <span className="text-[11px] text-on-surface-variant">Fichiers stockés localement</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="block text-headline-sm font-bold text-on-surface">{diagnostic.thumbnailsCount ?? 0}</span>
                <span className="text-[11px] text-on-surface-variant">Miniatures optimisées</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="block text-headline-sm font-bold text-on-surface">
                  {(diagnostic.totalSizeEstimatedBytes / (1024 * 1024)).toFixed(1)} Mo
                </span>
                <span className="text-[11px] text-on-surface-variant">Stockage navigateur estimé</span>
              </div>
            </div>

            {/* Missing thumbnails notice & repair */}
            {(diagnostic.missingThumbnailsCount ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl text-label-sm border border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">photo_size_select_actual</span>
                  <span className="text-primary font-semibold">
                    {diagnostic.missingThumbnailsCount} photo(s) sans miniature optimisée (rendu plus lent).
                  </span>
                </div>
                <button
                  onClick={handleRegenerateThumbnails}
                  disabled={isRegeneratingThumbs}
                  className="px-3 py-1 bg-primary text-on-primary rounded-lg text-label-xs font-bold active:scale-95 disabled:opacity-50 flex items-center gap-1"
                >
                  {isRegeneratingThumbs ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                      <span>Génération...</span>
                    </>
                  ) : (
                    <span>Générer</span>
                  )}
                </button>
              </div>
            )}

            {diagnostic.orphanedBlobsCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl text-label-sm border border-amber-500/20">
                <span className="text-amber-600 font-semibold">
                  {diagnostic.orphanedBlobsCount} fichier(s) orphelin(s) non référencé(s) détecté(s).
                </span>
                <button
                  onClick={handleCleanupOrphans}
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-label-xs font-bold active:scale-95"
                >
                  Nettoyer
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Backup Summary Modal */}
      {backupReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">verified</span>
              <h3 className="text-headline-sm font-bold text-on-surface">Sauvegarde terminée</h3>
            </div>
            <div className="space-y-2 text-body-sm text-on-surface-variant">
              <p>Total photos : <strong className="text-on-surface">{backupReport.totalPhotos}</strong></p>
              <p>Originaux locaux sauvegardés : <strong className="text-primary">{backupReport.localSaved}</strong></p>
              <p>Fichiers distants référencés : <strong className="text-on-surface">{backupReport.remoteReferences}</strong></p>
              {backupReport.missingLocal > 0 && (
                <p className="text-amber-600 font-semibold">
                  Fichiers locaux manquants : {backupReport.missingLocal}
                </p>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBackupReport(null)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Summary Modal */}
      {restoreReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
              <h3 className="text-headline-sm font-bold text-on-surface">Restauration terminée</h3>
            </div>
            <div className="space-y-2 text-body-sm text-on-surface-variant">
              <p>Photos restaurées : <strong className="text-primary">{restoreReport.restoredPhotos}</strong></p>
              <p>Albums restaurés : <strong className="text-on-surface">{restoreReport.restoredAlbums}</strong></p>
              {restoreReport.skippedPhotos > 0 && (
                <p>Photos ignorées : {restoreReport.skippedPhotos}</p>
              )}
              {restoreReport.integrityErrors.length > 0 && (
                <p className="text-error font-semibold">
                  {restoreReport.integrityErrors.length} anomalie(s) d'intégrité détectée(s)
                </p>
              )}
              {restoreReport.missingBlobs.length > 0 && (
                <p className="text-amber-600 font-semibold">
                  {restoreReport.missingBlobs.length} fichier(s) photo manquant(s)
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRestoreReport(null)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md"
              >
                Fermer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
              >
                Actualiser la galerie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zip Export Summary Modal */}
      {zipExportReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">folder_zip</span>
              <h3 className="text-headline-sm font-bold text-on-surface">Exportation ZIP</h3>
            </div>
            <div className="space-y-2 text-body-sm text-on-surface-variant">
              <p>Photos exportées : <strong className="text-primary">{zipExportReport.exported} / {zipExportReport.total}</strong></p>
              {zipExportReport.failed.length > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-label-xs text-amber-700 space-y-1 max-h-32 overflow-y-auto">
                  <p className="font-bold">{zipExportReport.failed.length} avertissement(s) :</p>
                  {zipExportReport.failed.map((f, i) => (
                    <p key={i}>• {f.name} : {f.reason}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setZipExportReport(null)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Simulation Modal */}
      <RestoreSimulationModal
        simulation={restoreSimulation}
        fileName={restorePendingFile?.name || ''}
        isRestoring={isExporting}
        onConfirm={handleConfirmRestore}
        onCancel={() => {
          setRestoreSimulation(null);
          setRestorePendingFile(null);
        }}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        progress={importProgress}
        result={importResult}
        isProcessing={isProcessingImport}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default Sharing;
