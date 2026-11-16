import React from 'react';
import { Link } from 'react-router-dom';
import { useLandingLang } from './LandingLangContext';

const PILLARS = {
  fr: [
    {
      title: 'Sauvegarde intégrale .gpro.zip',
      detail:
        'Archive portable regroupant l’ensemble des originaux locaux (photos/), les fiches EXIF, vos albums et vos retouches dans metadata.json.',
    },
    {
      title: 'Manifeste v2 & Empreintes SHA-256',
      detail:
        'Chaque fichier archivé est accompagné de sa somme de contrôle SHA-256 dans backup_manifest.json pour détecter toute altération.',
    },
    {
      title: 'Simulation avant restauration',
      detail:
        'Avant d’écrire dans IndexedDB, simulateRestoreBackup inspecte l’archive et affiche nouveaux clichés, doublons et erreurs éventuelles.',
    },
    {
      title: 'Diagnostic, réparation & purge',
      detail:
        'Estimation du quota navigateur, régénération en lot des miniatures manquantes et suppression ciblée des blobs ou vignettes orphelines.',
    },
  ],
  en: [
    {
      title: 'Full .gpro.zip Archive Backup',
      detail:
        'Portable ZIP bundle holding every local master file (photos/), EXIF records, albums, and non-destructive JSON edits inside metadata.json.',
    },
    {
      title: 'Manifest v2 & SHA-256 Checksums',
      detail:
        'Every archived photo is paired with its SHA-256 digest in backup_manifest.json to flag any missing or corrupted file.',
    },
    {
      title: 'Pre-Restore Dry-Run Simulation',
      detail:
        'Before writing to IndexedDB, simulateRestoreBackup inspects the ZIP and reports new photos, duplicates, and any integrity warnings.',
    },
    {
      title: 'Diagnostics, Repair & Cleanup',
      detail:
        'Browser storage quota estimates, batch regeneration of missing thumbnails, and targeted cleanup of orphaned blobs or thumbnails.',
    },
  ],
} as const;

const COPY = {
  fr: {
    eyebrow: 'Sauvegarde & Préservation',
    heading: "Vos souvenirs ne devraient jamais dépendre d'un seul appareil ou d'un seul navigateur.",
    p1: "Le stockage local dans IndexedDB offre rapidité et autonomie, mais reste lié au profil de votre navigateur. Une réinitialisation système, une suppression des données du site ou une panne matérielle effacerait vos fichiers locaux si aucune copie externe n'existe.",
    p2: (
      <>
        Exportez régulièrement votre photothèque en archive <code className="font-mono text-xs">.gpro.zip</code> vers un
        disque externe, un NAS ou un support de stockage indépendant.
      </>
    ),
    cta: 'Accéder aux outils de sauvegarde',
    treeTitle: "Structure d'une archive exportée (.gpro.zip)",
    treeBody: `bibliotheque-gallery-pro.gpro.zip
├── backup_manifest.json   # manifest_version: 2, compteurs et empreintes SHA-256
├── metadata.json          # fiches Photo, données EXIF, réglages JSON et albums
└── photos/
    ├── 1794604291-a1b2c.jpg   # fichiers maîtres originaux vérifiables
    └── ...`,
    imgAlt:
      "Capture réelle de l'onglet /sharing montrant la modale de prévisualisation avant restauration d'une archive .gpro.zip",
    imgCaption:
      "Capture réelle de l'onglet /sharing : prévisualisation et contrôle d'intégrité avant restauration d'une archive .gpro.zip.",
  },
  en: {
    eyebrow: 'Backup & Preservation',
    heading: 'Your memories should never depend on a single device or browser profile.',
    p1: 'In-browser IndexedDB storage delivers speed and independence, yet remains tied to a specific browser profile. Clearing site data, reinstalling your OS, or losing hardware will erase local files unless an external copy exists.',
    p2: (
      <>
        Export your library regularly as a <code className="font-mono text-xs">.gpro.zip</code> archive onto an external
        drive, NAS, or independent storage medium.
      </>
    ),
    cta: 'Open backup tools',
    treeTitle: 'Exported archive structure (.gpro.zip)',
    treeBody: `gallery-pro-library.gpro.zip
├── backup_manifest.json   # manifest_version: 2, counts & SHA-256 checksums
├── metadata.json          # Photo records, EXIF, JSON edits & albums
└── photos/
    ├── 1794604291-a1b2c.jpg   # verifiable original master files
    └── ...`,
    imgAlt: 'Live /sharing screenshot showing the restore dry-run modal for a .gpro.zip archive',
    imgCaption: 'Live screenshot of /sharing: integrity verification and dry-run preview before restoring a .gpro.zip.',
  },
} as const;

export const BackupSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];
  const pillars = PILLARS[lang];

  return (
    <section
      id="sauvegarde"
      aria-labelledby="backup-heading"
      className="bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F6A4B] font-semibold">
              {t.eyebrow}
            </p>
            <h2
              id="backup-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              {t.heading}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{t.p1}</p>
            <p className="text-sm text-neutral-800 font-medium leading-relaxed">{t.p2}</p>

            <div className="pt-2">
              <Link
                to="/sharing"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#18191D] hover:bg-neutral-800 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18191D]"
              >
                <span>{t.cta}</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  archive
                </span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {pillars.map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-neutral-200/90 p-5 space-y-2">
                  <h3 className="font-landing text-base font-bold text-[#18191D]">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#14161D] text-neutral-100 rounded-2xl p-6 font-mono text-xs leading-relaxed space-y-2 border border-neutral-800">
              <div className="text-neutral-400">{t.treeTitle}</div>
              <pre className="overflow-x-auto text-[11px] sm:text-xs text-neutral-200">{t.treeBody}</pre>
            </div>

            <figure className="rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
              <img
                src="/screenshots/sharing-restore-sim.png"
                alt={t.imgAlt}
                width={1366}
                height={860}
                loading="lazy"
                className="w-full h-auto block"
              />
              <figcaption className="px-4 py-2.5 bg-[#14161D] text-neutral-300 text-xs">{t.imgCaption}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
