import React from 'react';

const IntelligenceIA: React.FC = () => {
  const faces = [
    { name: 'Marie', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcjl1PfhHAK9xJ6Ack0SgGtABf9RJwJ7ucOcxhfbWVjREmbhDc1xn1X0CI1wV70KfSpzTenxB5FEEYNkR_hSiPND0brJhDJZ34zgQnyyG9JP7zDGDwmo_5EDcUKw0p0LOPGLGggvlqYsbjqaUod-8DgwPD4xC8OPnXNn41dV3vIdbf9InF9om_qzAu06cX-N0Qgv_Twwq8QCL7G6tkWWpqvCCDAczxMbOxWp6cycxZri16-TkP2z7TPJgZESnRy-Nt6QVDVX_AVpU' },
    { name: 'Thomas', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHE9prXQnUq7JQA8omke0C5aP4IuHpOY2BDx3JWigFKUIzeCQ9KL_cA9ptrjW-zN3BVpUrCrabv6WbuSGjcvMgqnBmpTxpYjNEEh7wwCcWQV8P4mnAalSf6oVKL2bFuWDYDu6eBO-qtIUdZwfRU45aPRsuXtzwCqQnQ3HVUxO1e6ceEMcW22ym7hRFw6VBE_w5mQW1LdXsCGJIBjd7Eg8V0QT9pC9X6pgarRAz9IqN_il-tmjBYUjtQHp9svdi1M-ryCSMxuxZG6k' },
    { name: 'Léa', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWNATPRxZ9lQZr6O_KAJpcX6jsfu88c9mmhxT20y5SnA9Duf3_i6XSbVZfulJJZRuIiSIsqel-X8DQFxAj1_daqghShejGyFZ8tpysSN1NZusj9tk8JvUfvvR15MELtspnAQXeaWiUylnkIKMgDXciRa-_WVR_ZxN-L2vYMzqzyTi8UqzLKTT_UN2t3y1wqac98QLf6WU-r7ZFMmZWDk54FshO8_G73b86pc4b-DhIFWfA9ksIhI5MArbAGpGmK8qjPcLNsJhvnVg' },
  ];

  return (
    <div className="px-container-padding space-y-section-margin pb-8">
      {/* Search Bar */}
      <section className="mt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary material-symbols-fill">auto_awesome</span>
          </div>
          <input 
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-lowest border-2 border-transparent focus:border-primary/20 focus:ring-0 shadow-sm font-body-lg text-on-surface placeholder:text-on-surface-variant transition-all outline-none" 
            placeholder="Chien à la plage en 2024..." 
            type="text" 
          />
        </div>
        <p className="mt-2 text-label-md font-semibold text-on-surface-variant ml-2 uppercase tracking-wider">Recherche sémantique</p>
      </section>

      {/* Facial Recognition */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Reconnaissance Faciale</h2>
          <button className="text-primary text-label-md font-semibold hover:underline">Voir tout</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-container-padding px-container-padding">
          {faces.map((face) => (
            <div key={face.name} className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary p-0.5 group-active:scale-95 transition-transform">
                <img src={face.url} alt={face.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-label-md font-medium text-on-surface">{face.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-outline-variant p-0.5 group-active:scale-95 transition-transform bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl">add</span>
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Inconnu</span>
          </div>
        </div>
      </section>

      {/* Intelligent Cleaning */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Nettoyage Intelligent</h2>
          <div className="px-2 py-0.5 bg-tertiary-container rounded-md text-[10px] font-bold text-on-tertiary-container uppercase tracking-tighter">Action requise</div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Photos floues', count: '42 éléments détectés', icon: 'blur_on', color: 'text-error', bg: 'bg-error-container/20' },
            { label: 'Doublons', count: '15 groupes identifiés', icon: 'content_copy', color: 'text-primary', bg: 'bg-primary-container/10' },
          ].map((item) => (
            <div key={item.label} className="bg-surface/70 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-sm border border-outline-variant/20 group hover:bg-surface-bright transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-body-lg font-semibold text-on-surface">{item.label}</h3>
                  <p className="text-label-sm text-on-surface-variant">{item.count}</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-surface-container-high text-primary text-label-md font-semibold group-active:scale-95 transition-transform">Réviser</button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Widget */}
      <section>
        <h2 className="text-headline-md font-bold text-on-surface mb-4">Carte Interactive</h2>
        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md group cursor-pointer">
          <img 
            alt="Map" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrzh1mwPv5_kYRZ1AEVot8ZSNytHRkNURjnQ85BPDhCRJHhVC294lFHMweATjCF3q5tVdJUURCq7gtZdWXqJN0dkvEvcLimVQN0pOeS0WXrD8ZgR_Jalh2vB505JjZRMb7aeuW5uwGN5qGhV1mZHzTILEuYvYP9dSxBWxokJT4Zi1XSSIw_npd_Vh1wP0p8wPyFUlB7JPmw1Hu1X_UF6pmFKqUkmkyz79CC4CjMx0j1ZF6uo-ep1LYHs_33DR1wRPZGkwZYfyuLEg" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="mt-2 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                482 photos ici
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 right-3">
            <button className="bg-white/90 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-label-md font-semibold shadow-sm active:scale-95 transition-transform flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">map</span>
              Explorer la carte
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntelligenceIA;
