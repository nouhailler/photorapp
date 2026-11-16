import React from 'react';
import { EDITORIAL_PHOTOS } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

const COPY = {
  fr: {
    eyebrow: 'Constat & Promesse',
    heading: "Vos souvenirs méritent mieux qu'un dossier oublié ou un abonnement cloud.",
    problems: [
      {
        index: '01',
        title: 'Des milliers de photographies difficiles à retrouver',
        description:
          'Entre dossiers nommés à la hâte, exports de smartphones et disques dispersés, retrouver un cliché précis par date, lieu ou appareil devient fastidieux.',
      },
      {
        index: '02',
        title: 'Des doublons, des clichés flous et des albums désorganisés',
        description:
          'Les séries en rafale et les imports répétés saturent votre espace sans outil simple pour repérer les copies exactes et les photos techniquement ratées.',
      },
      {
        index: '03',
        title: 'Une dépendance aux services cloud et à leurs conditions',
        description:
          'Confier des années d’archives familiales à un serveur distant impose un compte, des quotas évolutifs et une exposition à des changements d’offres.',
      },
    ],
    answerEyebrow: 'La réponse Gallery Pro',
    answerTitle:
      'Une photothèque personnelle qui réunit organisation, intelligence photographique, retouche et préservation.',
    answerBody:
      "Plutôt qu'une visionneuse minimaliste ou d'un stockage cloud captif, Gallery Pro rassemble dans votre navigateur la gestion chronologique, les albums dynamiques, la recherche EXIF et lexicale, l'édition non destructive et l'exportation vérifiée en archive intégrale.",
    highlights: [
      'Organisation par dates et albums',
      'Analyse et tri locaux',
      "Retouche respectant l'original",
      'Sauvegarde portable .gpro.zip',
    ],
  },
  en: {
    eyebrow: 'The Challenge & Our Approach',
    heading: 'Your memories deserve better than forgotten folders or a cloud subscription.',
    problems: [
      {
        index: '01',
        title: 'Thousands of photos that are hard to track down',
        description:
          'Between rushed folder names, phone exports, and scattered drives, finding a specific shot by date, location, or camera quickly becomes tedious.',
      },
      {
        index: '02',
        title: 'Duplicate files, blurry bursts, and messy albums',
        description:
          'Burst shots and repeated imports pile up with no straightforward way to isolate exact file duplicates or technically out-of-focus captures.',
      },
      {
        index: '03',
        title: 'Lock-in to cloud platforms and changing terms',
        description:
          'Handing years of family archives to remote servers requires accounts, evolving storage tiers, and reliance on external pricing or service terms.',
      },
    ],
    answerEyebrow: 'The Gallery Pro answer',
    answerTitle:
      'A personal photo library combining organization, local image tools, editing, and verifiable preservation.',
    answerBody:
      'Instead of a bare-bones viewer or captive cloud hosting, Gallery Pro brings chronological browsing, dynamic smart albums, EXIF and lexical search, non-destructive adjustments, and verifiable full-archive exports directly to your browser.',
    highlights: [
      'Date timelines & dynamic albums',
      'Local analysis & sorting',
      'Original-safe editing',
      'Portable .gpro.zip backups',
    ],
  },
} as const;

export const ProblemSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];

  return (
    <section
      aria-labelledby="problem-heading"
      className="bg-[#F2F1EC] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-neutral-500 font-semibold mb-3">
            {t.eyebrow}
          </p>
          <h2
            id="problem-heading"
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
          >
            {t.heading}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-300/80 pt-10">
          {t.problems.map((problem) => (
            <article key={problem.index} className="space-y-2.5">
              <span className="font-mono text-xs font-semibold text-[#1E35D0] tabular-nums">
                {problem.index}.
              </span>
              <h3 className="font-landing text-lg font-bold text-[#18191D] leading-snug">{problem.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{problem.description}</p>
            </article>
          ))}
        </div>

        {/* Gallery Pro response */}
        <div className="mt-14 bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F6A4B] font-semibold">
              {t.answerEyebrow}
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug [text-wrap:balance]">
              {t.answerTitle}
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{t.answerBody}</p>
            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-neutral-700">
              {t.highlights.map((item, idx) => (
                <React.Fragment key={item}>
                  {idx > 0 && (
                    <span aria-hidden="true" className="text-neutral-400">
                      ·
                    </span>
                  )}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <figure className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 aspect-[4/3]">
              <img
                src={EDITORIAL_PHOTOS.forestTrail.src}
                alt={lang === 'en' ? EDITORIAL_PHOTOS.forestTrail.altEn : EDITORIAL_PHOTOS.forestTrail.alt}
                loading="lazy"
                width={640}
                height={480}
                className="w-full h-full object-cover"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
