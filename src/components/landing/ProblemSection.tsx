import React from 'react';
import { EDITORIAL_PHOTOS } from './landingMedia';

const PROBLEMS = [
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
];

export const ProblemSection: React.FC = () => {
  return (
    <section
      aria-labelledby="problem-heading"
      className="bg-[#F2F1EC] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-neutral-500 font-semibold mb-3">
            Constat &amp; Promesse
          </p>
          <h2
            id="problem-heading"
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
          >
            Vos souvenirs méritent mieux qu&apos;un dossier oublié ou un abonnement cloud.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-300/80 pt-10">
          {PROBLEMS.map((problem) => (
            <article key={problem.index} className="space-y-2.5">
              <span className="font-mono text-xs font-semibold text-[#1E35D0] tabular-nums">
                {problem.index}.
              </span>
              <h3 className="font-landing text-lg font-bold text-[#18191D] leading-snug">
                {problem.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{problem.description}</p>
            </article>
          ))}
        </div>

        {/* La réponse Gallery Pro */}
        <div className="mt-14 bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F6A4B] font-semibold">
              La réponse Gallery Pro
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug [text-wrap:balance]">
              Une photothèque personnelle qui réunit organisation, intelligence photographique, retouche et préservation.
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Plutôt qu&apos;une visionneuse minimaliste ou d&apos;un stockage cloud captif, Gallery Pro rassemble
              dans votre navigateur la gestion chronologique, les albums dynamiques, la recherche EXIF et lexicale,
              l&apos;édition non destructive et l&apos;exportation vérifiée en archive intégrale.
            </p>
            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-neutral-700">
              <span>Organisation par dates et albums</span>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span>Analyse et tri locaux</span>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span>Retouche respectant l&apos;original</span>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span>Sauvegarde portable .gpro.zip</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <figure className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 aspect-[4/3]">
              <img
                src={EDITORIAL_PHOTOS.forestTrail.src}
                alt={EDITORIAL_PHOTOS.forestTrail.alt}
                loading="lazy"
                width={640}
                height={480}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
