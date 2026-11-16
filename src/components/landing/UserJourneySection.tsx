import React from 'react';
import { Link } from 'react-router-dom';
import { useLandingLang } from './LandingLangContext';

interface JourneyStep {
  step: string;
  action: string;
  title: string;
  description: string;
  detail: string;
  imageSrc: string;
  imageAlt: string;
  routeTo: string;
  routeLabel: string;
}

const STEPS_BY_LANG: Record<'fr' | 'en', JourneyStep[]> = {
  fr: [
    {
      step: '01',
      action: 'Importer',
      title: 'Importez vos photographies',
      description:
        'Sélectionnez vos fichiers par lots depuis votre ordinateur ou votre téléphone. Chaque cliché reste sur votre appareil et est indexé localement.',
      detail: 'Lecture EXIF & GPS · Empreinte SHA-256 · Miniatures WebP',
      imageSrc: '/screenshots/import-modal.png',
      imageAlt: 'Capture réelle de Gallery Pro après importation locale par lots de 8 photographies',
      routeTo: '/gallery',
      routeLabel: 'Importer dans /gallery',
    },
    {
      step: '02',
      action: 'Organiser',
      title: 'Organisez votre collection',
      description:
        'Classez librement vos photos dans des albums manuels ou créez des albums intelligents qui se mettent à jour selon vos règles (favoris, GPS, année, netteté).',
      detail: 'Albums manuels & dynamiques · Mise à jour atomique',
      imageSrc: '/screenshots/albums-view.png',
      imageAlt: 'Capture réelle de la vue /albums présentant les albums manuels et espaces intelligents instantanés',
      routeTo: '/albums',
      routeLabel: 'Explorer /albums',
    },
    {
      step: '03',
      action: 'Retrouver et retoucher',
      title: 'Retrouvez et améliorez vos photos',
      description:
        "Retrouvez un moment précis via la recherche avancée ou le carrousel Souvenirs, puis ajustez exposition, cadrage et couleurs sans modifier l'original.",
      detail: 'Recherche lexicale · Éditeur non destructif JSON',
      imageSrc: '/screenshots/photo-editor.png',
      imageAlt: "Capture réelle de l'éditeur non destructif Gallery Pro avec réglages d'image en direct",
      routeTo: '/search',
      routeLabel: 'Ouvrir /search',
    },
    {
      step: '04',
      action: 'Préserver',
      title: 'Gardez le contrôle de vos souvenirs',
      description:
        'Exportez régulièrement votre photothèque complète dans une archive portable .gpro.zip vérifiée par SHA-256 et simulez toute restauration avant écriture.',
      detail: 'Archive .gpro.zip · Contrôle SHA-256 · Simulation préalable',
      imageSrc: '/screenshots/sharing-restore-sim.png',
      imageAlt: "Capture réelle de l'onglet /sharing affichant la simulation avant restauration d'une archive .gpro.zip",
      routeTo: '/sharing',
      routeLabel: 'Voir /sharing',
    },
  ],
  en: [
    {
      step: '01',
      action: 'Import',
      title: 'Import your photographs',
      description:
        'Batch-select image files straight from your computer or smartphone. Every photo stays on your device and is indexed locally.',
      detail: 'EXIF & GPS readout · SHA-256 checksum · WebP thumbnails',
      imageSrc: '/screenshots/import-modal.png',
      imageAlt: 'Live Gallery Pro screenshot after batch importing 8 local photographs',
      routeTo: '/gallery',
      routeLabel: 'Import in /gallery',
    },
    {
      step: '02',
      action: 'Organize',
      title: 'Organize your collection',
      description:
        'Curate manual albums or create dynamic smart albums that evaluate live against your rules (favorites, GPS, year, sharpness, camera).',
      detail: 'Manual & smart albums · Atomic IndexedDB sync',
      imageSrc: '/screenshots/albums-view.png',
      imageAlt: 'Live /albums screenshot showing manual collections and instant smart album suggestions',
      routeTo: '/albums',
      routeLabel: 'Explore /albums',
    },
    {
      step: '03',
      action: 'Find & Edit',
      title: 'Rediscover and refine your shots',
      description:
        'Locate any moment with structured search or the Memories carousel, then tune exposure, crop, and color presets without altering the master file.',
      detail: 'Lexical search · JSON non-destructive editor',
      imageSrc: '/screenshots/photo-editor.png',
      imageAlt: 'Live screenshot of the non-destructive Gallery Pro editor with active adjustment sliders',
      routeTo: '/search',
      routeLabel: 'Open /search',
    },
    {
      step: '04',
      action: 'Preserve',
      title: 'Keep lasting control over your memories',
      description:
        'Regularly export your entire library into a portable .gpro.zip archive verified by SHA-256 checksums, and dry-run any restore before writing.',
      detail: '.gpro.zip archive · SHA-256 integrity · Restore simulation',
      imageSrc: '/screenshots/sharing-restore-sim.png',
      imageAlt: 'Live /sharing screenshot showing the restore dry-run preview modal for a .gpro.zip archive',
      routeTo: '/sharing',
      routeLabel: 'Open /sharing',
    },
  ],
};

const HEADER_COPY = {
  fr: {
    eyebrow: 'Parcours utilisateur',
    heading: 'De vos premières photos à une photothèque organisée.',
    subtitle: 'Gallery Pro vous accompagne à chaque étape, tout en conservant vos photographies sous votre contrôle.',
    note: (
      <>
        Dès la première ouverture de l&apos;application, un accueil en 3 étapes présente le fonctionnement local,
        complété par des infobulles <code className="font-mono">?</code> activables à la demande sur chaque outil.
      </>
    ),
    stepPrefix: 'Étape',
  },
  en: {
    eyebrow: 'User Journey',
    heading: 'From your first photos to a well-organized library.',
    subtitle: 'Gallery Pro guides you at every step while keeping your photographs strictly under your control.',
    note: (
      <>
        On first opening the app, a 3-step onboarding explains local storage alongside toggleable{' '}
        <code className="font-mono">?</code> contextual help tooltips across every slider and control.
      </>
    ),
    stepPrefix: 'Step',
  },
} as const;

export const UserJourneySection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = HEADER_COPY[lang];
  const steps = STEPS_BY_LANG[lang];

  return (
    <section
      id="parcours"
      aria-labelledby="journey-heading"
      className="bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              {t.eyebrow}
            </p>
            <h2
              id="journey-heading"
              className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              {t.heading}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>

          <p className="lg:col-span-4 text-xs text-neutral-600 leading-relaxed bg-[#F2F1EC] rounded-xl p-4 border border-neutral-200/80">
            {t.note}
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((item) => (
            <li
              key={item.step}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="bg-[#14161D] aspect-[16/10] overflow-hidden border-b border-neutral-200">
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    width={1366}
                    height={860}
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-semibold text-[#1E35D0] tabular-nums">
                      {t.stepPrefix} {item.step} · {item.action}
                    </span>
                    <Link
                      to={item.routeTo}
                      className="text-xs font-semibold text-neutral-700 hover:text-[#1E35D0] hover:underline whitespace-nowrap shrink-0"
                    >
                      {item.routeLabel} →
                    </Link>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18191D]">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-[#FAF9F6] border-t border-neutral-200/80 text-xs font-mono text-neutral-600">
                {item.detail}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
