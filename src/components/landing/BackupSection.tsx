import React from 'react';
import { Link } from 'react-router-dom';

const PRESERVATION_PILLARS = [
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
];

export const BackupSection: React.FC = () => {
  return (
    <section
      id="sauvegarde"
      aria-labelledby="backup-heading"
      className="bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Colonne gauche : message central de préservation */}
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F6A4B] font-semibold">
              Sauvegarde &amp; Préservation
            </p>
            <h2
              id="backup-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              Vos souvenirs ne devraient jamais dépendre d&apos;un seul appareil ou d&apos;un seul navigateur.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Le stockage local dans IndexedDB offre rapidité et autonomie, mais reste lié au profil de votre
              navigateur. Une réinitialisation système, une suppression des données du site ou une panne matérielle
              effacerait vos fichiers locaux si aucune copie externe n&apos;existe.
            </p>
            <p className="text-sm text-neutral-800 font-medium leading-relaxed">
              Exportez régulièrement votre photothèque en archive <code className="font-mono text-xs">.gpro.zip</code>{' '}
              vers un disque externe, un NAS ou un support de stockage indépendant.
            </p>

            <div className="pt-2">
              <Link
                to="/sharing"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#18191D] hover:bg-neutral-800 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18191D]"
              >
                <span>Accéder aux outils de sauvegarde</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  archive
                </span>
              </Link>
            </div>
          </div>

          {/* Colonne droite : architecture de l'archive & piliers techniques */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {PRESERVATION_PILLARS.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-neutral-200/90 p-5 space-y-2"
                >
                  <h3 className="font-landing text-base font-bold text-[#18191D]">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Aperçu vérifié de la structure d'archive .gpro.zip */}
            <div className="bg-[#14161D] text-neutral-100 rounded-2xl p-6 font-mono text-xs leading-relaxed space-y-2 border border-neutral-800">
              <div className="text-neutral-400">Structure d&apos;une archive exportée (.gpro.zip)</div>
              <pre className="overflow-x-auto text-[11px] sm:text-xs text-neutral-200">
{`bibliotheque-gallery-pro.gpro.zip
├── backup_manifest.json   # manifest_version: 2, compteurs et empreintes SHA-256
├── metadata.json          # fiches Photo, données EXIF, réglages JSON et albums
└── photos/
    ├── 1794604291-a1b2c.jpg   # fichiers maîtres originaux vérifiables
    └── ...`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
