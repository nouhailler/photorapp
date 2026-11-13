/**
 * Service de gestion des versions et mises à jour de Gallery Pro.
 * Prise en charge des vérifications manuelles, forcées et automatiques en arrière-plan.
 */

export interface UpdateStatus {
  version: string;
  releaseDate: string;
  lastCheckDate: string | null;
  isChecking: boolean;
  isUpdateAvailable: boolean;
  autoUpdateEnabled: boolean;
  statusMessage: string;
}

export const APP_VERSION = '2.5.0';
export const APP_RELEASE_DATE = '13 Novembre 2026';

const STORAGE_KEYS = {
  AUTO_UPDATE: 'gallery_pro_auto_update_enabled',
  LAST_CHECK: 'gallery_pro_last_update_check',
  INSTALLED_VERSION: 'gallery_pro_version',
};

// Listeners pour notifier les composants abonnés
type UpdateListener = (status: UpdateStatus) => void;
const listeners = new Set<UpdateListener>();

const currentStatus: UpdateStatus = {
  version: APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  lastCheckDate: localStorage.getItem(STORAGE_KEYS.LAST_CHECK) || new Date().toISOString(),
  isChecking: false,
  isUpdateAvailable: false,
  autoUpdateEnabled: localStorage.getItem(STORAGE_KEYS.AUTO_UPDATE) !== 'false', // défaut: true
  statusMessage: 'Application à jour avec la dernière version.',
};

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener({ ...currentStatus });
    } catch (e) {
      console.warn('Erreur écouteur updateService:', e);
    }
  });
}

/**
 * Récupère l'état actuel des mises à jour.
 */
export function getUpdateStatus(): UpdateStatus {
  return { ...currentStatus };
}

/**
 * S'abonne aux changements d'état des mises à jour.
 */
export function subscribeToUpdates(listener: UpdateListener): () => void {
  listeners.add(listener);
  listener({ ...currentStatus });
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Active ou désactive les mises à jour automatiques en arrière-plan.
 */
export function setAutoUpdateEnabled(enabled: boolean): void {
  currentStatus.autoUpdateEnabled = enabled;
  localStorage.setItem(STORAGE_KEYS.AUTO_UPDATE, enabled ? 'true' : 'false');
  notifyListeners();
}

/**
 * Enregistre la date de la dernière vérification.
 */
function recordCheckTime() {
  const now = new Date().toISOString();
  currentStatus.lastCheckDate = now;
  localStorage.setItem(STORAGE_KEYS.LAST_CHECK, now);
}

/**
 * Vérifie la disponibilité d'une nouvelle version via le Service Worker et le réseau.
 */
export async function checkForUpdates(manual = false): Promise<{ hasUpdate: boolean; message: string }> {
  currentStatus.isChecking = true;
  currentStatus.statusMessage = manual
    ? 'Recherche de mises à jour sur le serveur...'
    : 'Vérification automatique en arrière-plan...';
  notifyListeners();

  recordCheckTime();

  try {
    let updateFound = false;

    // 1. Si un Service Worker est actif, demander une vérification
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          if (registration.waiting || registration.installing) {
            updateFound = true;
          }
        }
      } catch (swErr) {
        console.warn('[UpdateService] Vérification ServiceWorker:', swErr);
      }
    }

    // 2. Vérification d'en-tête cache ou index.html
    try {
      const response = await fetch(`/?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      const etag = response.headers.get('etag');
      if (etag && etag.length > 0) {
        const lastEtag = localStorage.getItem('gallery_pro_app_etag');
        if (lastEtag && lastEtag !== etag) {
          updateFound = true;
        }
        localStorage.setItem('gallery_pro_app_etag', etag);
      }
    } catch {
      // Mode hors-ligne toléré
    }

    currentStatus.isChecking = false;
    currentStatus.isUpdateAvailable = updateFound;

    if (updateFound) {
      currentStatus.statusMessage = 'Une nouvelle version est disponible !';
      notifyListeners();

      // Si auto-update est activé, appliquer automatiquement en arrière-plan
      if (currentStatus.autoUpdateEnabled) {
        console.log('[UpdateService] Auto-update activé : application en arrière-plan...');
        setTimeout(() => {
          forceAppUpdate();
        }, 1200);
      }

      return { hasUpdate: true, message: 'Nouvelle version prête à être installée.' };
    }

    currentStatus.statusMessage = 'Votre photothèque est parfaitement à jour (v' + APP_VERSION + ').';
    notifyListeners();
    return { hasUpdate: false, message: 'Aucune nouvelle version disponible.' };
  } catch (error) {
    currentStatus.isChecking = false;
    currentStatus.statusMessage = 'Vérification impossible (mode hors-ligne actif).';
    notifyListeners();
    return { hasUpdate: false, message: error instanceof Error ? error.message : 'Erreur réseau' };
  }
}

/**
 * Force la mise à jour immédiate de l'application :
 * Purge les caches du Service Worker et recharge la dernière version sans toucher à IndexedDB.
 */
export async function forceAppUpdate(): Promise<void> {
  currentStatus.isChecking = true;
  currentStatus.statusMessage = 'Mise à jour forcée en cours...';
  notifyListeners();

  try {
    // 1. Purge des caches Web Cache API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // 2. Notifier le Service Worker d'activer la nouvelle version immédiatement
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      if (registration) {
        await registration.update();
      }
    }
  } catch (err) {
    console.warn('[UpdateService] Erreur lors de la purge de cache:', err);
  } finally {
    // 3. Rechargement propre de la page
    window.location.reload();
  }
}

/**
 * Initialise le système de surveillance des mises à jour automatiques en arrière-plan.
 */
let backgroundTimer: ReturnType<typeof setInterval> | null = null;

export function initBackgroundUpdateChecker(intervalMs = 15 * 60 * 1000): () => void {
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
  }

  // 1. Vérification initiale discrète après 8 secondes
  const initialTimeout = setTimeout(() => {
    if (currentStatus.autoUpdateEnabled) {
      checkForUpdates(false).catch(() => {});
    }
  }, 8000);

  // 2. Intervalle périodique
  backgroundTimer = setInterval(() => {
    if (currentStatus.autoUpdateEnabled && navigator.onLine) {
      checkForUpdates(false).catch(() => {});
    }
  }, intervalMs);

  // 3. Déclencheurs réseau et focus
  const handleOnline = () => {
    if (currentStatus.autoUpdateEnabled) {
      checkForUpdates(false).catch(() => {});
    }
  };

  const handleFocus = () => {
    // Vérifier si la dernière vérification remonte à plus de 30 minutes
    const lastCheck = currentStatus.lastCheckDate ? new Date(currentStatus.lastCheckDate).getTime() : 0;
    if (currentStatus.autoUpdateEnabled && Date.now() - lastCheck > 30 * 60 * 1000) {
      checkForUpdates(false).catch(() => {});
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('focus', handleFocus);

  return () => {
    clearTimeout(initialTimeout);
    if (backgroundTimer) clearInterval(backgroundTimer);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('focus', handleFocus);
  };
}
