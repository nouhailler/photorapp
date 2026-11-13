import React from 'react';
import { Link } from 'react-router-dom';
import { APP_VERSION, APP_RELEASE_DATE } from '../../services/updateService';
import { GITHUB_REPO_URL } from './landingMedia';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#101218] text-neutral-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2.5 text-white">
            <img src="/icon.svg" alt="" width={24} height={24} className="w-6 h-6 rounded-md" />
            <span className="font-landing font-bold text-base">Gallery Pro — Your Visual Legacy</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Photothèque personnelle Local-First stockée localement via IndexedDB. Version {APP_VERSION} ({APP_RELEASE_DATE}).
          </p>
        </div>

        <nav
          aria-label="Liens de pied de page"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm"
        >
          <Link to="/gallery" className="text-neutral-200 hover:text-white hover:underline">
            Application Gallery Pro
          </Link>
          <Link to="/settings" className="text-neutral-300 hover:text-white hover:underline">
            Paramètres système
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            Dépôt GitHub
          </a>
          <a
            href={`${GITHUB_REPO_URL}/blob/main/CONTEXT.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            Architecture technique (CONTEXT.md)
          </a>
          <a
            href={`${GITHUB_REPO_URL}/blob/main/CHANGELOG.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            Changelog
          </a>
        </nav>
      </div>
    </footer>
  );
};
