// Premier tutoriel de Photorapp. Chaque `narrate` est à la fois affiché et parlé.
// Cibles : attributs data-demo-id="…" à poser sur les éléments de l'app.
import { defineScenario, type RuntimeStep } from '@nouhailler/video-studio'

export default defineScenario<RuntimeStep>({
  id: 'presentation-fr',
  video: {
    title: 'Découvrez Photorapp',
    language: 'fr',
    voiceEnabled: true,
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    clock: '2026-11-20T21:30:00+01:00',   // heure simulée : prises reproductibles
    intro: { eyebrow: 'Tutoriel', title: 'Découvrez Photorapp', narration: 'Bienvenue dans Photorapp.' },
    outro: { title: 'Photorapp', bullets: ['À compléter'], narration: 'Merci d’avoir regardé.' },
    firstChapter: 'Premiers pas',
  },
  scenario: {
    name: 'presentation-fr',
    label: 'Présentation',
    steps: [
      { type: 'narrate', text: 'Voici l’écran d’accueil de Photorapp.' },
      // { type: 'click', target: 'menu-principal', narrate: 'Ouvrons le menu.', video: { chapter: 'Le menu' } },
      // { type: 'highlight', target: 'liste', narrate: 'La liste se met à jour en direct.', video: { zoom: 1.2 } },
      // { type: 'type', target: 'recherche', text: 'Lune', narrate: 'On peut aussi rechercher.' },
    ],
  },
})
