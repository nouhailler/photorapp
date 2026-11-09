import React, { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { usePhotos } from '../context/usePhotos';
import { processPhotosImport } from '../services/importService';
import type { ImportProgress, ImportResult } from '../services/importService';
import { ImportModal } from './ImportModal';

const TopAppBar: React.FC = () => {
  const { photos, addPhotos } = usePhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showModal, setShowModal] = useState(false);

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

      // Update in-memory state
      if (result.importedPhotos.length > 0) {
        await addPhotos(result.importedPhotos.map((p) => ({ photo: p })));
      }
      setImportResult(result);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setIsProcessing(false);
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-container-padding">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">photo_library</span>
          </div>
          <div>
            <h1 className="text-headline-md font-bold tracking-tight text-on-surface">Gallery Pro</h1>
            <p className="text-[10px] text-on-surface-variant font-medium -mt-1">Photothèque Privée & Locale</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 bg-primary text-on-primary text-label-md font-semibold px-4 py-2 rounded-xl active:scale-95 duration-200 ease-in-out transition-colors hover:bg-primary-container shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Importer</span>
          </button>
        </div>
      </header>

      <ImportModal
        isOpen={showModal}
        progress={importProgress}
        result={importResult}
        isProcessing={isProcessing}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

const BottomNavBar: React.FC = () => {
  const navItems = [
    { label: 'Photos', icon: 'photo_library', path: '/' },
    { label: 'Albums', icon: 'collections_bookmark', path: '/albums' },
    { label: 'IA & Qualité', icon: 'auto_awesome', path: '/ia' },
    { label: 'Recherche', icon: 'search', path: '/search' },
    { label: 'Sauvegarde', icon: 'cloud_sync', path: '/sharing' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-t border-outline-variant/30 pb-safe flex justify-around items-center px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-3 py-1 active:scale-90 duration-200 transition-all cursor-pointer ${
              isActive
                ? 'text-primary bg-primary-container/20 rounded-xl'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined ${isActive ? 'material-symbols-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-label-sm font-medium mt-0.5">{item.label}</span>
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
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <TopAppBar />
      <main className="pt-20 pb-24 flex-grow">{children}</main>
      <BottomNavBar />
    </div>
  );
};

export default Layout;
