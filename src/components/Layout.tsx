import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { usePhotos } from '../context/usePhotos';
import { useHelp } from '../context/useHelp';
import { processPhotosImport } from '../services/importService';
import type { ImportProgress, ImportResult } from '../services/importService';
import { ImportModal } from './ImportModal';
import { HamburgerMenu } from './HamburgerMenu';
import { OnboardingModal } from './OnboardingModal';
import { PWAInstallButton } from './PWAInstallButton';
import { HelpTooltip } from './HelpTooltip';
import { ActivityCenterModal } from './ActivityCenterModal';
import { activityService } from '../services/activityService';
import { initBackgroundUpdateChecker } from '../services/updateService';

interface TopAppBarProps {
  onOpenMenu: () => void;
  onImportClick: () => void;
  onOpenActivityCenter: () => void;
  runningTasksCount: number;
}

const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenMenu,
  onImportClick,
  onOpenActivityCenter,
  runningTasksCount,
}) => {
  const { isHelpModeActive, toggleHelpMode } = useHelp();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/75 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-container-padding border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Trigger */}
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-2xl bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface active:scale-95 transition-all shadow-xs"
          title="Ouvrir le menu des fonctionnalités par catégorie"
          aria-label="Menu principal"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-headline-md font-bold tracking-tight text-on-surface">Gallery Pro</h1>
              <HelpTooltip
                title="Bienvenue sur Gallery Pro"
                text="Photothèque 100% locale, privée et hors-ligne. Cliquez sur le menu pour explorer toutes les fonctionnalités classées par catégorie."
              />
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium -mt-1">Photothèque Privée & Locale</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Activity Center Trigger */}
        <button
          onClick={onOpenActivityCenter}
          className="relative w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface transition-all active:scale-95"
          title="Centre d'activité et tâches en arrière-plan"
          aria-label="Centre d'activité"
        >
          <span className={`material-symbols-outlined text-[20px] ${runningTasksCount > 0 ? 'text-primary animate-pulse' : ''}`}>
            pending_actions
          </span>
          {runningTasksCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shadow-sm">
              {runningTasksCount}
            </span>
          )}
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Toggle Mode Débutant / Infobulles */}
        <button
          onClick={toggleHelpMode}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            isHelpModeActive
              ? 'bg-primary/15 text-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
          title={isHelpModeActive ? "Mode aide novice activé (infobulles visibles). Cliquez pour masquer." : "Mode aide novice désactivé. Cliquez pour afficher les infobulles."}
          aria-label="Mode assistance débutant"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isHelpModeActive ? 'help' : 'help_outline'}
          </span>
        </button>

        {/* Import Button */}
        <button
          onClick={onImportClick}
          className="flex items-center gap-1.5 bg-primary text-on-primary text-label-md font-semibold px-3.5 py-2 rounded-xl active:scale-95 duration-200 ease-in-out transition-colors hover:bg-primary-container shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
          <span className="hidden sm:inline">Importer</span>
        </button>
      </div>
    </header>
  );
};

const BottomNavBar: React.FC = () => {
  const navItems = [
    { label: 'Photos', icon: 'photo_library', path: '/' },
    { label: 'Albums', icon: 'collections_bookmark', path: '/albums' },
    { label: 'IA & Qualité', icon: 'auto_awesome', path: '/ia' },
    { label: 'Recherche', icon: 'search', path: '/search' },
    { label: 'Sauvegarde', icon: 'cloud_sync', path: '/sharing' },
    { label: 'Système', icon: 'settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/30 pb-safe flex justify-around items-center px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-2.5 py-1 active:scale-90 duration-200 transition-all cursor-pointer ${
              isActive
                ? 'text-primary bg-primary-container/25 rounded-xl font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'material-symbols-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { photos, addPhotos } = usePhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [runningTasksCount, setRunningTasksCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Initialisation de la surveillance automatique des mises à jour en arrière-plan
  useEffect(() => {
    const cleanup = initBackgroundUpdateChecker(15 * 60 * 1000);
    const unsubActivity = activityService.subscribe((tasks) => {
      const active = tasks.filter((t) => t.status === 'running' || t.status === 'pending').length;
      setRunningTasksCount(active);
    });
    return () => {
      cleanup();
      unsubActivity();
    };
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setShowModal(true);
    setImportResult(null);

    try {
      const result = await processPhotosImport(files, photos, (progress) => {
        setImportProgress(progress);
      });

      if (result.importedPhotos.length > 0) {
        await addPhotos(result.importedPhotos.map((p) => ({ photo: p })));
      }
      setImportResult(result);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Hidden File Input for Image Import */}
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Top App Bar with Hamburger trigger */}
      <TopAppBar
        onOpenMenu={() => setIsMenuOpen(true)}
        onImportClick={handleImportClick}
        onOpenActivityCenter={() => setIsActivityOpen(true)}
        runningTasksCount={runningTasksCount}
      />

      {/* Categorized Hamburger Drawer */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onImportClick={handleImportClick}
        onOpenActivityCenter={() => {
          setIsMenuOpen(false);
          setIsActivityOpen(true);
        }}
      />

      {/* Activity Center Modal */}
      <ActivityCenterModal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* Mandatory Onboarding & Legal Disclaimer Modal */}
      <OnboardingModal />

      {/* Main View Container */}
      <main className="pt-20 pb-24 flex-grow">{children}</main>

      {/* Bottom Nav Bar */}
      <BottomNavBar />

      {/* Import Modal */}
      <ImportModal
        isOpen={showModal}
        progress={importProgress}
        result={importResult}
        isProcessing={isProcessing}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Layout;
