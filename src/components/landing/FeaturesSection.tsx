import React from 'react';
import { Link } from 'react-router-dom';
import { EDITORIAL_PHOTOS } from './landingMedia';

export const FeaturesSection: React.FC = () => {
  return (
    <section
      id="fonctionnalites"
      aria-labelledby="features-heading"
      className="bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-24">
        {/* En-tête éditorial */}
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold mb-3">
            Fonctionnalités principales
          </p>
          <h2
            id="features-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
          >
            Retrouvez, organisez et sublimez vos souvenirs — sans rien céder sur la maîtrise locale.
          </h2>
        </div>

        {/* 01. Galerie personnelle & Navigation par catégories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs font-semibold text-[#1E35D0]">01. Galerie personnelle</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug">
              Retrouvez vos photographies dans une galerie conçue autour de vos souvenirs.
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Importez vos clichés par lots directement depuis votre appareil, sans téléversement sur serveur. Gallery
              Pro lit les métadonnées EXIF, classe votre photothèque par date de prise de vue et fluidifie les grandes
              collections dès 48 photos grâce à des miniatures WebP virtualisées.
            </p>
            <ul className="space-y-2 text-sm text-neutral-700 pt-1">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                  check
                </span>
                <span>Grille chronologique, favoris étoilés et sélection multiple rapide</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                  check
                </span>
                <span>Lecture EXIF complète (boîtier, focale, ouverture, ISO, GPS)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#1E35D0] mt-0.5" aria-hidden="true">
                  check
                </span>
                <span>Visionneuse plein écran et diaporama cadencé avec lecture aléatoire</span>
              </li>
            </ul>
            <div className="pt-1">
              <a
                href="#demo-galerie"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E35D0] hover:underline"
              >
                <span>Essayer la mini-galerie de démonstration</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_downward
                </span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <figure className="rounded-2xl overflow-hidden border border-neutral-200 bg-[#0F172A] shadow-lg">
              <img
                src="/screenshots/gallery-drawer.png"
                alt="Capture réelle de l'application Gallery Pro montrant le menu latéral par catégories ouvert sur /gallery"
                width={1366}
                height={860}
                loading="lazy"
                className="w-full h-auto block"
              />
              <figcaption className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <span>Menu latéral par catégories : Photothèque, Outils intelligents et Gestion des données</span>
                <Link to="/gallery" className="text-[#93C5FD] hover:underline font-medium whitespace-nowrap shrink-0">
                  Ouvrir /gallery →
                </Link>
              </figcaption>
            </figure>

            <figure className="rounded-xl overflow-hidden border border-neutral-200 bg-[#0F172A] flex flex-col sm:flex-row items-center gap-4 p-3">
              <img
                src="/app_preview.svg"
                alt="Illustration vectorielle complémentaire de l'architecture d'interface Gallery Pro"
                width={1200}
                height={680}
                loading="lazy"
                className="w-full sm:w-52 h-auto rounded-lg shrink-0 border border-white/10"
              />
              <figcaption className="text-xs text-neutral-300 leading-relaxed pr-2">
                <strong className="text-white block mb-0.5">Vue d&apos;architecture (/app_preview.svg)</strong>
                Schéma synthétique de l&apos;espace de travail local issu du dépôt.
              </figcaption>
            </figure>
          </div>
        </div>

        {/* 02. Albums, Recherche & Géolocalisation EXIF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-neutral-200">
          <article className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">02. Albums &amp; Collections</span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18191D] leading-snug">
                Albums manuels ou dynamiques sans dupliquer vos fichiers
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Créez des albums classiques avec photo de couverture personnalisée, ou définissez des albums
                intelligents évalués en direct selon vos critères (favoris, année, mois, lieu, GPS, netteté, appareil).
              </p>
            </div>
            <Link
              to="/albums"
              className="text-xs font-semibold text-[#1E35D0] hover:underline pt-2 inline-flex items-center gap-1"
            >
              <span>Voir les albums dans l&apos;application →</span>
            </Link>
          </article>

          <article className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">03. Recherche locale</span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18191D] leading-snug">
                Retrouvez une photo par mots-clés, saison ou critères EXIF
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Le parseur <code className="font-mono text-xs">naturalSearchService.ts</code> combine règles lexicales
                locales et dictionnaire de 17 concepts synonymes en français et en anglais, sans serveur ni modèle LLM.
              </p>
            </div>
            <a
              href="#demo-recherche"
              className="text-xs font-semibold text-[#1E35D0] hover:underline pt-2 inline-flex items-center gap-1"
            >
              <span>Tester la recherche en direct ↓</span>
            </a>
          </article>

          <article className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">04. Carte &amp; Retouche</span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18191D] leading-snug">
                Voyages sur carte Leaflet &amp; retouche non destructive
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Placez automatiquement vos clichés dotés de coordonnées GPS sur carte OpenStreetMap (connexion requise
                pour les tuiles) et retouchez vos images en conservant les originaux intacts dans IndexedDB.
              </p>
            </div>
            <a
              href="#demo-retouche"
              className="text-xs font-semibold text-[#1E35D0] hover:underline pt-2 inline-flex items-center gap-1"
            >
              <span>Tester le comparateur Avant/Après ↓</span>
            </a>
          </article>
        </div>

        {/* 05. Souvenirs photographiques */}
        <div className="pt-8 border-t border-neutral-200 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-3">
              <span className="font-mono text-xs font-semibold text-[#1E35D0]">05. Souvenirs photographiques</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D] leading-snug [text-wrap:balance]">
                Redécouvrez les moments que vous aviez presque oubliés.
              </h3>
            </div>
            <p className="lg:col-span-5 text-sm text-neutral-600 leading-relaxed">
              Le carrousel <code className="font-mono text-xs">souvenirService.ts</code> compose automatiquement des
              rétrospectives fondées strictement sur vos dates et lieux EXIF réels — sans jamais en inventer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
              <img
                src={EDITORIAL_PHOTOS.coastalSunset.src}
                alt={EDITORIAL_PHOTOS.coastalSunset.alt}
                width={640}
                height={480}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-serif text-lg font-medium">Ce jour-là, il y a un an et plus</p>
                <p className="text-xs text-white/80 mt-1">
                  Sélections anniversaires à 1, 2, 3, 5, 7 ou 10 ans d&apos;après la date réelle du cliché.
                </p>
              </figcaption>
            </figure>

            <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
              <img
                src={EDITORIAL_PHOTOS.forestTrail.src}
                alt={EDITORIAL_PHOTOS.forestTrail.alt}
                width={640}
                height={480}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-serif text-lg font-medium">À cette période de l&apos;année</p>
                <p className="text-xs text-white/80 mt-1">
                  Moments des années passées dans une fenêtre de ±6 jours autour de la date du jour.
                </p>
              </figcaption>
            </figure>

            <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
              <img
                src={EDITORIAL_PHOTOS.alpineLake.src}
                alt={EDITORIAL_PHOTOS.alpineLake.alt}
                width={640}
                height={480}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-serif text-lg font-medium">Escapades &amp; Coups de cœur oubliés</p>
                <p className="text-xs text-white/80 mt-1">
                  Regroupements par lieu renseigné (4 photos min.) et favoris anciens de plus de 6 mois.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
