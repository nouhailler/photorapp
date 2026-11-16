import React, { useState } from 'react';
import { GITHUB_REPO_URL } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: Record<'fr' | 'en', FaqItem[]> = {
  fr: [
    {
      question: 'Gallery Pro est-elle gratuite ?',
      answer: (
        <>
          Le code source public du projet est consultable librement sur{' '}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E35D0] underline font-medium"
          >
            GitHub (nouhailler/photorapp)
          </a>{' '}
          et aucun abonnement ni compte payant n&apos;est requis dans l&apos;application. Aucun fichier{' '}
          <code className="font-mono text-xs">LICENSE</code> n&apos;étant actuellement présent dans le dépôt, vérifiez
          les conditions de distribution directement auprès du mainteneur avant toute réutilisation commerciale.
        </>
      ),
    },
    {
      question: 'Dois-je créer un compte ?',
      answer:
        'Non. Aucun compte, adresse e-mail ou authentification n’est demandé pour importer, organiser, retoucher ou sauvegarder vos photographies.',
    },
    {
      question: 'Où sont stockées mes photographies ?',
      answer: (
        <>
          Vos clichés importés, leurs miniatures et vos métadonnées sont enregistrés localement sur votre appareil dans
          la base <strong>IndexedDB</strong> du navigateur (<code className="font-mono text-xs">GalleryProDB</code> v3 :
          stores <code className="font-mono text-xs">photos</code>, <code className="font-mono text-xs">thumbnails</code>,{' '}
          <code className="font-mono text-xs">metadata</code>, <code className="font-mono text-xs">albums</code>,{' '}
          <code className="font-mono text-xs">persons</code> et <code className="font-mono text-xs">settings</code>).
        </>
      ),
    },
    {
      question: 'Mes photos sont-elles envoyées sur un serveur ?',
      answer:
        'Non. Les photos importées restent dans votre navigateur. Les seules requêtes réseau externes émises par le site concernent le chargement des polices/icônes Google Fonts, des tuiles OpenStreetMap sur la carte GPS, des 3 images de démonstration initiales avant tout import, d’une requête HEAD de mise à jour et du catalogue public OpenRouter si vous demandez explicitement à l’afficher dans /ia.',
    },
    {
      question: 'Puis-je utiliser Gallery Pro sans connexion Internet ?',
      answer:
        'Oui pour gérer votre photothèque locale une fois l’application chargée au moins une fois (le Service Worker PWA met l’interface en cache). En revanche, les fonds de carte OpenStreetMap et les polices web non encore mises en cache nécessitent une connexion.',
    },
    {
      question: 'Comment sauvegarder ma photothèque ?',
      answer:
        'Ouvrez l’onglet Sauvegarde (/sharing) dans l’application pour générer une archive intégrale .gpro.zip contenant vos fichiers originaux locaux, metadata.json et le manifeste de contrôle SHA-256.',
    },
    {
      question: 'Puis-je récupérer mes photos sur un autre ordinateur ?',
      answer:
        'Oui. Exportez votre archive .gpro.zip depuis le premier ordinateur, puis importez-la dans /sharing sur le second poste : un écran de simulation vérifie les empreintes SHA-256 et le contenu avant toute écriture.',
    },
    {
      question: 'L’application fonctionne-t-elle sur smartphone ?',
      answer:
        'Oui. L’interface s’adapte aux mobiles avec navigation adaptée, menu latéral par catégories et installation possible sur l’écran d’accueil sur Android (Chrome/Edge) comme sur iOS (Safari via Partager → Sur l’écran d’accueil).',
    },
    {
      question: 'Gallery Pro utilise-t-elle une véritable intelligence artificielle ?',
      answer:
        'Non au sens de réseaux de neurones entraînés : la classification des scènes (aiVisionService.ts) et l’évaluation de netteté/exposition reposent sur des algorithmes déterministes de traitement d’image (couleurs HSV, segmentation haut/bas, Laplacien, dHash), la recherche naturelle sur des règles lexicales locales et le regroupement des personnes sur un découpage expérimental opt-in par lots de portraits sans biométrie.',
    },
    {
      question: 'Mes photographies originales sont-elles modifiées ?',
      answer:
        'Non. L’éditeur enregistre vos curseurs, filtres, rotations et recadrages en JSON dans les métadonnées. Le fichier original conservé dans IndexedDB reste intact et peut être restauré à tout moment.',
    },
    {
      question: 'Que se passe-t-il si j’efface les données de mon navigateur ?',
      answer:
        'Effacer les données de site (ou désinstaller le navigateur selon le système) supprime la base IndexedDB locale. Conservez systématiquement des sauvegardes .gpro.zip sur un support externe indépendant.',
    },
  ],
  en: [
    {
      question: 'Is Gallery Pro free to use?',
      answer: (
        <>
          The public source code is openly browsable on{' '}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E35D0] underline font-medium"
          >
            GitHub (nouhailler/photorapp)
          </a>{' '}
          with no paid account or subscription required inside the app. Because no{' '}
          <code className="font-mono text-xs">LICENSE</code> file is currently present in the repository, verify
          redistribution terms with the maintainer prior to commercial reuse.
        </>
      ),
    },
    {
      question: 'Do I need to create an account?',
      answer:
        'No. No account, email address, or sign-in is required to import, organize, edit, or back up your photographs.',
    },
    {
      question: 'Where are my photographs stored?',
      answer: (
        <>
          Your imported photos, thumbnails, and metadata are saved locally on your device inside your browser&apos;s{' '}
          <strong>IndexedDB</strong> (<code className="font-mono text-xs">GalleryProDB</code> v3 across stores{' '}
          <code className="font-mono text-xs">photos</code>, <code className="font-mono text-xs">thumbnails</code>,{' '}
          <code className="font-mono text-xs">metadata</code>, <code className="font-mono text-xs">albums</code>,{' '}
          <code className="font-mono text-xs">persons</code>, and <code className="font-mono text-xs">settings</code>).
        </>
      ),
    },
    {
      question: 'Are my photos uploaded to any server?',
      answer:
        'No. Imported photographs remain inside your browser. The only external requests triggered by the app are Google Fonts/Icons stylesheets, OpenStreetMap tiles on the GPS map, 3 starter sample images before your first local import, a lightweight HEAD update check, and the public OpenRouter model catalog if you explicitly request it under /ia.',
    },
    {
      question: 'Can I use Gallery Pro offline?',
      answer:
        'Yes, for managing your local library once the app has loaded at least once (the PWA Service Worker caches the app shell). However, OpenStreetMap tiles and uncached web fonts require an internet connection.',
    },
    {
      question: 'How do I back up my library?',
      answer:
        'Open the Backup tab (/sharing) inside the app to export a complete .gpro.zip archive containing your original local files, metadata.json, and the SHA-256 verification manifest.',
    },
    {
      question: 'Can I restore my photos onto another computer?',
      answer:
        'Yes. Export your .gpro.zip archive from the first computer, then select it under /sharing on the second machine: a dry-run preview checks SHA-256 checksums and contents before any write.',
    },
    {
      question: 'Does it work on smartphones?',
      answer:
        'Yes. The interface adapts cleanly to mobile screens with a bottom nav bar, categorized drawer menu, and home screen installation on Android (Chrome/Edge) and iOS (Safari via Share → Add to Home Screen).',
    },
    {
      question: 'Does Gallery Pro use a real neural-network AI?',
      answer:
        'No — not in the sense of trained deep-learning models: scene classification (aiVisionService.ts) and sharpness/exposure scoring use deterministic image-processing heuristics (HSV colors, top/bottom segmentation, Laplacian variance, dHash), natural search uses local lexical rules, and people grouping uses an experimental opt-in batch split with zero biometric matching.',
    },
    {
      question: 'Are my original photographs altered when editing?',
      answer:
        'No. The editor saves sliders, filter presets, rotation, and crop bounds as JSON metadata. The master file in IndexedDB remains untouched and can be reset at any time.',
    },
    {
      question: 'What happens if I clear my browser site data?',
      answer:
        'Clearing site data (or uninstalling the browser depending on your OS) deletes the local IndexedDB database. Always store regular .gpro.zip exports on an independent external drive or NAS.',
    },
  ],
};

const HEADER_COPY = {
  fr: {
    eyebrow: 'Questions fréquentes',
    heading: "Réponses claires sur le stockage local, la confidentialité et l'usage",
  },
  en: {
    eyebrow: 'Frequently Asked Questions',
    heading: 'Clear answers on local storage, privacy, and daily usage',
  },
} as const;

export const FaqSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = HEADER_COPY[lang];
  const items = FAQ_ITEMS[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-[#F2F1EC] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">{t.eyebrow}</p>
          <h2 id="faq-heading" className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D]">
            {t.heading}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-button-${idx}`;

            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleIndex(idx)}
                    className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E35D0]"
                  >
                    <span className="font-landing text-sm sm:text-base font-semibold text-[#18191D]">
                      {item.question}
                    </span>
                    <span
                      className="material-symbols-outlined text-[20px] text-neutral-500 shrink-0 transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      aria-hidden="true"
                    >
                      expand_more
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 sm:px-6 pb-5 text-sm text-neutral-600 leading-relaxed"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
