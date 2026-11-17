import React from 'react';
import { Link } from 'react-router-dom';
import { APP_VERSION, APP_RELEASE_DATE } from '../../services/updateService';
import { GITHUB_REPO_URL, YOUTUBE_TUTORIAL_URL } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

const COPY = {
  fr: {
    tagline: `Photothèque personnelle Local-First stockée localement via IndexedDB. Version ${APP_VERSION} (${APP_RELEASE_DATE}).`,
    navAria: 'Liens de pied de page',
    appLink: 'Application Gallery Pro',
    settingsLink: 'Paramètres système',
    tutorialLink: 'Tutoriel vidéo (YouTube)',
    githubLink: 'Dépôt GitHub',
    contextLink: 'Architecture technique (CONTEXT.md)',
    changelogLink: 'Changelog',
    altLangLabel: 'English version (/en)',
    altLangTo: '/en',
  },
  en: {
    tagline: `Local-First personal photo library stored locally in IndexedDB. Version ${APP_VERSION} (${APP_RELEASE_DATE}).`,
    navAria: 'Footer links',
    appLink: 'Gallery Pro App',
    settingsLink: 'System Settings',
    tutorialLink: 'Video Tutorial (YouTube)',
    githubLink: 'GitHub Repository',
    contextLink: 'Technical Architecture (CONTEXT.md)',
    changelogLink: 'Changelog',
    altLangLabel: 'Version française (/)',
    altLangTo: '/',
  },
} as const;

export const LandingFooter: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];

  return (
    <footer className="bg-[#101218] text-neutral-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2.5 text-white">
            <img src="/icon.svg" alt="" width={24} height={24} className="w-6 h-6 rounded-md" />
            <span className="font-landing font-bold text-base">Gallery Pro — Your Visual Legacy</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">{t.tagline}</p>
        </div>

        <nav aria-label={t.navAria} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
          <Link to="/gallery" className="text-neutral-200 hover:text-white hover:underline">
            {t.appLink}
          </Link>
          <Link to="/settings" className="text-neutral-300 hover:text-white hover:underline">
            {t.settingsLink}
          </Link>
          <Link to={t.altLangTo} className="text-neutral-300 hover:text-white hover:underline">
            {t.altLangLabel}
          </Link>
          <a
            href={YOUTUBE_TUTORIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            {t.tutorialLink}
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            {t.githubLink}
          </a>
          <a
            href={`${GITHUB_REPO_URL}/blob/main/CONTEXT.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            {t.contextLink}
          </a>
          <a
            href={`${GITHUB_REPO_URL}/blob/main/CHANGELOG.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white hover:underline"
          >
            {t.changelogLink}
          </a>
        </nav>
      </div>
    </footer>
  );
};
