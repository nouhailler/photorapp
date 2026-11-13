import React, { useState } from 'react';
import { GITHUB_REPO_URL } from './landingMedia';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
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
];

export const FaqSection: React.FC = () => {
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
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
            Questions fréquentes
          </p>
          <h2
            id="faq-heading"
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D]"
          >
            Réponses claires sur le stockage local, la confidentialité et l&apos;usage
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200">
          {FAQ_ITEMS.map((item, idx) => {
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
