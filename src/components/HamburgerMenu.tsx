import React from 'react';
import { NavLink } from 'react-router-dom';
import { useHelp } from '../context/useHelp';
import { APP_VERSION, APP_RELEASE_DATE } from '../services/updateService';
import { PWAInstallButton } from './PWAInstallButton';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onImportClick?: () => void;
}

interface MenuCategory {
  title: string;
  icon: string;
  items: {
    label: string;
    path?: string;
    action?: () => void;
    icon: string;
    description: string;
    badge?: string;
  }[];
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  onImportClick,
}) => {
  const { isHelpModeActive, toggleHelpMode, openLegalModal } = useHelp();

  if (!isOpen) return null;

  const categories: MenuCategory[] = [
    {
      title: 'Photothèque & Souvenirs',
      icon: 'photo_library',
      items: [
        {
          label: 'Galerie Principale',
          path: '/',
          icon: 'grid_view',
          description: 'Mur chronologique de tous vos clichés',
        },
        {
          label: 'Albums & Collections',
          path: '/albums',
          icon: 'collections_bookmark',
          description: 'Albums manuels et albums intelligents',
        },
        {
          label: 'Recherche Avancée & Filtres',
          path: '/search',
          icon: 'manage_search',
          description: 'Recherche par mots-clés, mois, tags et GPS',
        },
      ],
    },
    {
      title: 'Outils Intelligents & Qualité',
      icon: 'auto_awesome',
      items: [
        {
          label: 'Intelligence & Nettoyage',
          path: '/ia',
          icon: 'psychology',
          description: 'Analyse locale des pixels, flou et exposition',
        },
        {
          label: 'Doublons & Similitudes',
          path: '/ia',
          icon: 'content_copy',
          description: 'Hachage cryptographique SHA-256 et dHash',
        },
        {
          label: 'Carte Géographique Réelle',
          path: '/ia',
          icon: 'explore',
          description: 'Visualisation GPS Leaflet de vos voyages',
        },
      ],
    },
    {
      title: 'Gestion des Données',
      icon: 'folder_zip',
      items: [
        {
          label: 'Sauvegarde & Restauration',
          path: '/sharing',
          icon: 'archive',
          description: 'Archives intégrales .gpro.zip et export catalogue',
        },
        {
          label: 'Importer des photos',
          action: () => {
            onClose();
            onImportClick?.();
          },
          icon: 'upload_file',
          description: 'Sélectionner des images depuis votre appareil',
          badge: 'Nouveau',
        },
        {
          label: 'Santé du Stockage Local',
          path: '/sharing',
          icon: 'storage',
          description: 'Diagnostic IndexedDB et nettoyage des orphelins',
        },
      ],
    },
    {
      title: 'Système & Préférences',
      icon: 'settings',
      items: [
        {
          label: 'Paramètres Système & Mises à Jour',
          path: '/settings',
          icon: 'system_update',
          description: 'Versions, vérification manuelle et auto-update',
        },
        {
          label: 'Guide & Infobulles pour Novices',
          action: () => {
            toggleHelpMode();
          },
          icon: isHelpModeActive ? 'help' : 'help_outline',
          description: isHelpModeActive ? 'Activé (Infobulles visibles)' : 'Désactivé (Masqué)',
          badge: isHelpModeActive ? 'Actif' : 'Off',
        },
        {
          label: 'Mentions Légales & Responsabilité',
          action: () => {
            onClose();
            openLegalModal();
          },
          icon: 'gavel',
          description: 'Décharge de responsabilité sur les données',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="relative w-full max-w-xs sm:max-w-sm bg-surface border-r border-outline-variant/30 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[24px]">photo_library</span>
            </div>
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">Gallery Pro</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-bold text-primary">v{APP_VERSION}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="text-[10px] text-on-surface-variant font-medium">100% Local</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/40 active:scale-95 transition-all"
            title="Fermer le menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* PWA Install Promo in Drawer */}
        <div className="p-3 bg-surface-container-lowest border-b border-outline-variant/10">
          <PWAInstallButton variant="full" />
        </div>

        {/* Categories Navigation */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-2">
              <div className="flex items-center gap-2 px-2 text-primary font-bold text-label-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">{category.icon}</span>
                <span>{category.title}</span>
              </div>

              <div className="space-y-1">
                {category.items.map((item, itemIdx) => {
                  if (item.path) {
                    return (
                      <NavLink
                        key={itemIdx}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-start gap-3 p-2.5 rounded-2xl transition-all ${
                            isActive
                              ? 'bg-primary-container text-on-primary-container shadow-xs'
                              : 'hover:bg-surface-container text-on-surface'
                          }`
                        }
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
                          {item.icon}
                        </span>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-label-sm font-bold truncate">{item.label}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-on-surface-variant truncate">{item.description}</p>
                        </div>
                      </NavLink>
                    );
                  }

                  return (
                    <button
                      key={itemIdx}
                      onClick={item.action}
                      className="w-full text-left flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface-container text-on-surface transition-all active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
                        {item.icon}
                      </span>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-label-sm font-bold truncate">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer with version and release date */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/50 text-[11px] text-on-surface-variant space-y-1">
          <div className="flex justify-between items-center">
            <span>Version de l'application</span>
            <span className="font-bold text-on-surface">v{APP_VERSION}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Date de sortie</span>
            <span className="font-semibold">{APP_RELEASE_DATE}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
