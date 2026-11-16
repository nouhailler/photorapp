import React, { useState, useEffect } from 'react';
import {
  APP_VERSION,
  getAppReleaseDate,
  getLocalizedUpdateMessage,
  getUpdateStatus,
  subscribeToUpdates,
  checkForUpdates,
  forceAppUpdate,
  setAutoUpdateEnabled,
} from '../services/updateService';
import type { UpdateStatus } from '../services/updateService';
import { useHelp } from '../context/useHelp';
import { usePhotos } from '../context/usePhotos';
import { useLanguage } from '../context/useLanguage';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { HelpTooltip } from '../components/HelpTooltip';
import { runFullBenchmarkSuite } from '../services/benchmarkService';
import type { BenchmarkMeasurement } from '../services/benchmarkService';
import { regenerateAllMissingThumbnails } from '../services/thumbnailService';
import { cleanupOrphanedBlobs, cleanupOrphanedThumbnails } from '../utils/db';

export const SystemSettings: React.FC = () => {
  const { isHelpModeActive, toggleHelpMode, openLegalModal } = useHelp();
  const { photos } = usePhotos();
  const { lang, setLang, isEn } = useLanguage();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(getUpdateStatus);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Benchmark state
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState<string>('');
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkMeasurement[]>([]);

  // Maintenance state
  const [isMaintaining, setIsMaintaining] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');


  useEffect(() => {
    const unsubscribe = subscribeToUpdates((status) => {
      setUpdateStatus(status);
    });
    return () => unsubscribe();
  }, []);

  const handleManualCheck = async () => {
    setFeedbackMessage(isEn ? 'Checking for updates...' : 'Recherche des mises à jour en cours...');
    const result = await checkForUpdates(true, lang);
    setFeedbackMessage(result.message);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  const handleForceUpdate = async () => {
    if (
      window.confirm(
        isEn
          ? 'Forcing an update will clear the application cache and reload the latest version. Your photos and albums in IndexedDB will not be touched. Continue?'
          : "Forcer la mise à jour va rafraîchir le cache de l'application et recharger la dernière version. Vos photos et albums dans la base de données IndexedDB ne seront pas modifiés. Continuer ?"
      )
    ) {
      await forceAppUpdate(lang);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    setBenchmarkResults([]);
    try {
      const results = await runFullBenchmarkSuite((count, idx, total) => {
        setBenchmarkProgress(
          isEn
            ? `Running load test: ${count.toLocaleString('en-US')} photos (${idx}/${total})...`
            : `Test de charge en cours : ${count.toLocaleString('fr-FR')} photos (${idx}/${total})...`
        );
      });
      setBenchmarkResults(results);
      setBenchmarkProgress('');
    } catch (err) {
      console.error('Benchmark error:', err);
      setBenchmarkProgress(isEn ? 'Error running performance test.' : 'Erreur lors du test de performance.');
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleRepairThumbnails = async () => {
    setIsMaintaining(true);
    setMaintenanceMessage(isEn ? 'Generating missing thumbnails...' : 'Génération des miniatures manquantes...');
    try {
      const res = await regenerateAllMissingThumbnails(photos);
      const activeIds = photos.map((p) => p.id);
      const orphanBlobs = await cleanupOrphanedBlobs(activeIds);
      const orphanThumbs = await cleanupOrphanedThumbnails(activeIds);
      setMaintenanceMessage(
        isEn
          ? `Maintenance complete: ${res.generated} thumbnail(s) regenerated, ${orphanBlobs + orphanThumbs} orphaned item(s) cleaned.`
          : `Maintenance terminée : ${res.generated} miniature(s) régénérée(s), ${orphanBlobs + orphanThumbs} élément(s) orphelin(s) nettoyé(s).`
      );
    } catch (err) {
      console.error('Maintenance error:', err);
      setMaintenanceMessage(isEn ? 'Error during maintenance.' : 'Erreur lors de la maintenance.');
    } finally {
      setIsMaintaining(false);
    }
  };


  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return isEn ? 'Never checked' : 'Jamais vérifié';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="px-container-padding space-y-section-margin max-w-4xl mx-auto pb-28">
      {/* Header */}
      <section className="pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-lg font-bold text-on-surface">
            {isEn ? 'System Settings' : 'Paramètres Système'}
          </h2>
          <HelpTooltip
            title={isEn ? 'Settings & Updates' : 'Paramètres & Mises à Jour'}
            text={
              isEn
                ? 'Manage your library version, automatic background updates, legal disclaimers, language, and device installation here.'
                : "Gérez ici la version de votre photothèque, les mises à jour automatiques en arrière-plan, les mentions légales et l'installation sur votre appareil."
            }
          />
        </div>
        <p className="text-body-sm text-on-surface-variant mt-1">
          {isEn
            ? 'Version details, Service Worker maintenance, language preference, and local data control.'
            : 'Informations de version, maintenance du Service Worker et contrôle des données locales.'}
        </p>
      </section>

      {/* Feedback Alert if any */}
      {feedbackMessage && (
        <div className="p-4 bg-primary-container/40 border border-primary text-on-primary-container rounded-2xl text-label-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Card 0: Interface Language */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">translate</span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              {isEn ? 'Application Language' : "Langue de l'application"}
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {isEn
                ? 'Choose your preferred language across the gallery and landing page.'
                : 'Choisissez votre langue préférée pour toute la photothèque et la page d’accueil.'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center rounded-xl bg-surface p-1 border border-outline-variant/30 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setLang('fr')}
            className={`px-4 py-2 rounded-lg text-label-sm font-bold transition-all ${
              lang === 'fr' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Français (FR)
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-4 py-2 rounded-lg text-label-sm font-bold transition-all ${
              lang === 'en' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            English (EN)
          </button>
        </div>
      </section>

      {/* Card 1: Fiche d'identité de l'application */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[26px]">terminal</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">Gallery Pro — Local-First PWA</h3>
              <p className="text-label-xs text-on-surface-variant">
                {isEn
                  ? '100% autonomous and secure architecture running in your browser'
                  : 'Architecture 100% autonome et sécurisée dans votre navigateur'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-label-xs font-bold uppercase tracking-wider">
            Stable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-semibold mb-1">
              <span>{isEn ? 'Current version' : 'Version actuelle'}</span>
              <HelpTooltip text={isEn ? 'Version number installed on this device.' : 'Numéro de version du logiciel installé sur cet appareil.'} />
            </div>
            <p className="text-headline-sm font-bold text-primary">v{APP_VERSION}</p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-semibold mb-1">
              <span>{isEn ? 'Release date' : 'Date de sortie'}</span>
              <HelpTooltip text={isEn ? 'Official release date of this Gallery Pro build.' : 'Date officielle de publication de cette version de Gallery Pro.'} />
            </div>
            <p className="text-headline-sm font-bold text-on-surface">{getAppReleaseDate(lang)}</p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-semibold mb-1">
              <span>{isEn ? 'Last check' : 'Dernière vérification'}</span>
              <HelpTooltip text={isEn ? 'Exact date and time of the latest update check.' : 'Date et heure exactes de la dernière recherche de mise à jour effectuée.'} />
            </div>
            <p className="text-body-sm font-bold text-on-surface truncate">
              {formatDateTime(updateStatus.lastCheckDate)}
            </p>
          </div>
        </div>
      </section>

      {/* Card 2: Gestion des Mises à Jour & Auto-Update */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">system_update</span>
            <h3 className="text-headline-sm font-bold text-on-surface">
              {isEn ? 'Software Updates' : 'Mises à Jour du Logiciel'}
            </h3>
            <HelpTooltip
              title={isEn ? 'Automatic updates' : 'Mises à jour automatiques'}
              text={
                isEn
                  ? 'When enabled, the application checks in the background for a new version and installs it smoothly without interrupting your workflow.'
                  : "Lorsque cette option est activée, l'application vérifie en tâche de fond la présence d'une nouvelle version et l'installe automatiquement sans interrompre votre travail."
              }
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${updateStatus.isChecking ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <div>
              <p className="text-label-md font-bold text-on-surface">
                {isEn ? 'System status' : 'Statut du système'}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {getLocalizedUpdateMessage(updateStatus, lang)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleManualCheck}
              disabled={updateStatus.isChecking}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-variant text-primary rounded-xl font-bold text-label-sm active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${updateStatus.isChecking ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isEn ? 'Check for updates' : 'Vérifier les mises à jour'}</span>
            </button>

            <button
              onClick={handleForceUpdate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl font-bold text-label-sm active:scale-95 transition-all shadow-xs"
              title={isEn ? 'Clear caches and reload the latest version' : 'Vider les caches et réinstaller la dernière version du code'}
            >
              <span className="material-symbols-outlined text-[18px]">cached</span>
              <span>{isEn ? 'Force update' : 'Forcer la mise à jour'}</span>
            </button>
          </div>
        </div>

        {/* Toggle Mises à jour automatiques en arrière-plan */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-label-md font-bold text-on-surface">
                {isEn ? 'Automatic background updates' : 'Mises à jour automatiques en arrière-plan'}
              </span>
              <HelpTooltip
                text={
                  isEn
                    ? 'Automatically checks for new versions when online or at regular intervals and applies them seamlessly.'
                    : 'Recherche automatiquement de nouvelles versions lors de la connexion réseau ou à intervalle régulier, et les applique discrètement.'
                }
              />
            </div>
            <p className="text-label-xs text-on-surface-variant">
              {isEn
                ? 'Silent periodic checks and seamless installation without losing local data.'
                : 'Recherche périodique silencieuse et installation transparente sans perte de données locales.'}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={updateStatus.autoUpdateEnabled}
              onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </section>

      {/* Card 3: Installation de l'application (PWA) */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">install_mobile</span>
            <h3 className="text-headline-sm font-bold text-on-surface">
              {isEn ? 'Install on Mobile or Desktop' : 'Installation sur Mobile ou Desktop'}
            </h3>
            <HelpTooltip
              text={
                isEn
                  ? 'Adds Gallery Pro to your phone home screen or desktop app launcher for instant full-screen access.'
                  : "Ajoute Gallery Pro sur l'écran d'accueil de votre téléphone ou dans vos applications d'ordinateur pour un accès ultra-rapide et plein écran."
              }
            />
          </div>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          {isEn
            ? 'Gallery Pro is a certified Progressive Web App (PWA). You can add it to your home screen without going through an app store.'
            : "Gallery Pro est une Progressive Web App certifiée (PWA). Vous pouvez l'ajouter à votre écran d'accueil sans passer par un magasin d'applications commercial."}
        </p>

        <PWAInstallButton variant="banner" />
      </section>

      {/* Card 4: Mentions Légales & Responsabilité */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">gavel</span>
            <h3 className="text-headline-sm font-bold text-on-surface">
              {isEn ? 'Legal Notice & Liability' : 'Mentions Légales & Responsabilité'}
            </h3>
          </div>
          <button
            onClick={openLegalModal}
            className="text-primary text-label-xs font-bold hover:underline"
          >
            {isEn ? 'Review full onboarding' : "Relire l'onboarding complet"}
          </button>
        </div>

        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-body-sm text-on-surface-variant space-y-2">
          <p className="font-bold text-amber-700 dark:text-amber-400">
            {isEn ? 'Application data disclaimer:' : "Clause de non-responsabilité sur les données de l'application :"}
          </p>
          <p className="text-[12px] leading-relaxed">
            {isEn
              ? 'The author, developer, and publisher of Gallery Pro expressly disclaim any liability regarding the photos, files, content, and metadata provided, imported, or stored in this application. The app runs fully locally on the user’s device (IndexedDB). The user remains solely responsible for their data and for keeping external backup copies via the ZIP backup tool.'
              : "L'auteur, développeur et éditeur de Gallery Pro décline expressément toute responsabilité relative aux photos, fichiers, contenus et métadonnées fournis, importés ou stockés dans cette application. L'application fonctionne en autonomie locale complète sur le terminal de l'utilisateur (IndexedDB). L'utilisateur est seul responsable de ses données ainsi que de la conservation de copies de sauvegarde externes via l'outil de sauvegarde ZIP."}
          </p>
        </div>
      </section>

      {/* Card 5: Assistance et Mode Débutant */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h4 className="text-headline-sm font-bold text-on-surface">
            {isEn ? 'Beginner Guide & Help Tooltips Mode' : 'Mode Guide Débutant & Infobulles'}
          </h4>
          <p className="text-body-sm text-on-surface-variant">
            {isEn ? (
              <>
                Displays interactive help badges{' '}
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                  ?
                </span>{' '}
                across all screens to explain each control.
              </>
            ) : (
              <>
                Affiche des pastilles interactives d&apos;aide{' '}
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                  ?
                </span>{' '}
                sur tous les écrans pour expliquer le rôle de chaque champ.
              </>
            )}
          </p>
        </div>

        <button
          onClick={toggleHelpMode}
          className={`px-5 py-2.5 rounded-xl font-bold text-label-sm active:scale-95 transition-all shrink-0 ${
            isHelpModeActive
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {isHelpModeActive ? (isEn ? 'Enabled' : 'Activé') : (isEn ? 'Disabled' : 'Désactivé')}
        </button>
      </section>

      {/* Card 6: Performance & Benchmark Suite (1k to 20k photos) */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">speed</span>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {isEn
                  ? 'Load & Capacity Benchmark (1,000 to 20,000 photos)'
                  : 'Test de Charge & Capacité (1 000 à 20 000 photos)'}
              </h3>
              <p className="text-[12px] text-on-surface-variant">
                {isEn
                  ? 'Measures real browser performance: indexing, text search, date grouping, and memory usage.'
                  : 'Mesure les performances réelles de votre navigateur : indexation, recherche, regroupement et mémoire.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-sm flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all shrink-0"
          >
            <span className={`material-symbols-outlined text-[18px] ${isBenchmarking ? 'animate-spin' : ''}`}>
              {isBenchmarking ? 'sync' : 'play_arrow'}
            </span>
            <span>
              {isBenchmarking
                ? isEn ? 'Running benchmark...' : 'Benchmark en cours...'
                : isEn ? 'Run benchmark' : 'Lancer le benchmark'}
            </span>
          </button>
        </div>

        {benchmarkProgress && (
          <div className="p-3 bg-primary-container/20 rounded-xl text-label-xs font-bold text-primary">
            {benchmarkProgress}
          </div>
        )}

        {benchmarkResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant">
                  <th className="py-2 pr-3 font-bold">{isEn ? 'Scale' : 'Volume'}</th>
                  <th className="py-2 px-3 font-bold">{isEn ? 'Load' : 'Chargement'}</th>
                  <th className="py-2 px-3 font-bold">{isEn ? 'Text search' : 'Recherche texte'}</th>
                  <th className="py-2 px-3 font-bold">{isEn ? 'Multi-filters' : 'Filtres croisés'}</th>
                  <th className="py-2 px-3 font-bold">{isEn ? 'Date grouping' : 'Groupage dates'}</th>
                  <th className="py-2 pl-3 font-bold">{isEn ? 'Est. memory' : 'Mémoire est.'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {benchmarkResults.map((row) => (
                  <tr key={row.photoCount} className="hover:bg-surface/50">
                    <td className="py-2.5 pr-3 font-bold text-primary">
                      {row.photoCount.toLocaleString(isEn ? 'en-US' : 'fr-FR')} photos
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{row.initialLoadMs} ms</td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{row.searchFullTextMs} ms</td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{row.searchFilterMultiCriteriaMs} ms</td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{row.groupingByDateMs} ms</td>
                    <td className="py-2.5 pl-3 font-semibold text-on-surface">
                      {row.estimatedMemoryMb} {isEn ? 'MB' : 'Mo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Card 7: Réparation & Maintenance IndexedDB */}
      <section className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">build_circle</span>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {isEn ? 'Thumbnail Repair & Optimization' : 'Réparation & Optimisation des Miniatures'}
              </h3>
              <p className="text-[12px] text-on-surface-variant">
                {isEn
                  ? 'Rebuilds missing thumbnails and purges orphaned files to keep scrolling silky at 60 fps.'
                  : 'Reconstruit les miniatures manquantes et purge les fichiers orphelins pour garantir une fluidité à 60 fps.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRepairThumbnails}
            disabled={isMaintaining}
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-variant text-primary rounded-xl font-bold text-label-sm flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all shrink-0"
          >
            <span className={`material-symbols-outlined text-[18px] ${isMaintaining ? 'animate-spin' : ''}`}>
              {isMaintaining ? 'sync' : 'handyman'}
            </span>
            <span>
              {isMaintaining
                ? isEn ? 'Maintaining...' : 'Maintenance...'
                : isEn ? 'Regenerate & Clean' : 'Régénérer & Nettoyer'}
            </span>
          </button>
        </div>

        {maintenanceMessage && (
          <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-label-xs font-bold">
            {maintenanceMessage}
          </div>
        )}
      </section>
    </div>
  );
};

export default SystemSettings;

