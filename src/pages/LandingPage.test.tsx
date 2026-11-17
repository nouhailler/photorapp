import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { LanguageProvider } from '../context/LanguageContext';
import { HelpProvider } from '../context/HelpContext';

describe('LandingPage', () => {
  beforeEach(() => {
    window.matchMedia =
      window.matchMedia ||
      (() =>
        ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList);
  });

  const renderLanding = (initialPath = '/') =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<LandingPage initialLang="fr" />} />
          <Route path="/en" element={<LandingPage initialLang="en" />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders the hero value proposition, real interface caption, primary app CTA (/gallery), and GitHub link without onboarding popup', () => {
    renderLanding();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Toutes vos photos\. Une seule photothèque\. Sous votre contrôle\./i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Votre photothèque, organisée et accessible depuis votre navigateur\./i)
    ).toBeInTheDocument();

    const appLinks = screen.getAllByRole('link', {
      name: /Ouvrir Gallery Pro|Découvrir Gallery Pro|Accéder à Gallery Pro|Ouvrir ma propre photothèque/i,
    });
    expect(appLinks.length).toBeGreaterThanOrEqual(2);
    expect(appLinks.every((el) => el.getAttribute('href') === '/gallery')).toBe(true);

    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
    expect(githubLinks.length).toBeGreaterThanOrEqual(2);
    expect(githubLinks.some((el) => el.getAttribute('href') === 'https://github.com/nouhailler/photorapp')).toBe(true);

    const youtubeLinks = screen.getAllByRole('link', { name: /tutoriel|YouTube/i });
    expect(youtubeLinks.length).toBeGreaterThanOrEqual(3);
    expect(youtubeLinks.every((el) => el.getAttribute('href') === 'https://www.youtube.com/watch?v=Z--ZypHe5LM')).toBe(true);

    const frYoutubeIframe = screen.getByTitle(/Tutoriel vidéo complet de Gallery Pro sur YouTube/i);
    expect(frYoutubeIframe.tagName).toBe('IFRAME');
    expect(frYoutubeIframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/Z--ZypHe5LM?rel=0');
    expect(frYoutubeIframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    // Public visitors must NOT see the legal onboarding modal overlay
    expect(screen.queryByText(/Mentions légales et responsabilité/i)).not.toBeInTheDocument();
  });

  it('provides an isolated interactive DemoGallery with filters and keyboard-accessible lightbox', () => {
    renderLanding();

    // 8 local demonstration thumbnails initially visible
    const photoButtons = screen.getAllByRole('button', { name: /Agrandir /i });
    expect(photoButtons).toHaveLength(8);

    // Filter by Littoral (2 photos)
    fireEvent.click(screen.getByRole('button', { name: 'Littoral' }));
    const coastalButtons = screen.getAllByRole('button', { name: /Agrandir /i });
    expect(coastalButtons).toHaveLength(2);

    // Open lightbox on the first coastal photo
    fireEvent.click(coastalButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Exemple 1 \/ 2/i)).toBeInTheDocument();

    // Navigate to next demo photo
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    expect(screen.getByText(/Exemple 2 \/ 2/i)).toBeInTheDocument();

    // Close with Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('runs the real local natural search parser on both sample chips and direct input typing', () => {
    renderLanding();

    // Default sample: "Montagnes en hiver" -> month 1
    expect(screen.getByText(/^mois 1$/i)).toBeInTheDocument();

    // Switch to GPS query chip
    fireEvent.click(screen.getByRole('button', { name: /« Photos de plage avec GPS »/i }));
    expect(screen.getByText(/true \(Avec GPS\)/i)).toBeInTheDocument();

    // Type a custom query directly into the search input
    const searchInput = screen.getByLabelText(/Saisir une requête de recherche de démonstration/i);
    fireEvent.change(searchInput, { target: { value: 'Coups de cœur 2024 à Paris' } });
    expect(screen.getByText(/true \(Favoris\)/i)).toBeInTheDocument();
    expect(screen.getByText(/année 2024/i)).toBeInTheDocument();
  });

  it('updates before/after preview label and slider value in DemoPhotoEditor', () => {
    renderLanding();

    expect(screen.getByText(/Prévisualisation \(Vivid\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Noir et blanc' }));
    expect(screen.getByText(/Prévisualisation \(Noir et blanc\)/i)).toBeInTheDocument();

    const rangeSlider = screen.getByRole('slider', { name: /Curseur de comparaison avant\/après/i });
    fireEvent.change(rangeSlider, { target: { value: '75' } });
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders the 4-step visual user journey from import to preservation', () => {
    renderLanding();

    expect(screen.getByRole('heading', { name: /De vos premières photos à une photothèque organisée\./i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Importez vos photographies/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Organisez votre collection/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Retrouvez et améliorez vos photos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Gardez le contrôle de vos souvenirs/i })).toBeInTheDocument();
  });

  it('toggles FAQ accordion items cleanly with aria-expanded', () => {
    renderLanding();

    const firstQuestion = screen.getByRole('button', { name: /Gallery Pro est-elle gratuite \?/i });
    const secondQuestion = screen.getByRole('button', { name: /Dois-je créer un compte \?/i });

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(secondQuestion);
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Aucun compte, adresse e-mail ou authentification/i)).toBeInTheDocument();
  });

  it('toggles the mobile navigation drawer cleanly', () => {
    renderLanding();

    const menuButton = screen.getByRole('button', { name: /Ouvrir le menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: /Fermer le menu/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: /Menu mobile/i })).toBeInTheDocument();
  });

  it('displays real application screenshots alongside the complementary app_preview.svg diagram', () => {
    const { container } = renderLanding();

    const imgSrcs = Array.from(container.querySelectorAll('img')).map((img) => img.getAttribute('src'));
    expect(imgSrcs).toContain('/screenshots/gallery-grid.png');
    expect(imgSrcs).toContain('/screenshots/gallery-drawer.png');
    expect(imgSrcs).toContain('/screenshots/import-modal.png');
    expect(imgSrcs).toContain('/screenshots/albums-view.png');
    expect(imgSrcs).toContain('/screenshots/photo-editor.png');
    expect(imgSrcs).toContain('/screenshots/ia-analysis-map.png');
    expect(imgSrcs).toContain('/screenshots/sharing-restore-sim.png');
    expect(imgSrcs).toContain('/app_preview.svg');
  });

  it('renders the full English landing page at /en with English interactive demos and switches back cleanly via FR/EN toggle', () => {
    renderLanding('/en');

    expect(document.documentElement.lang).toBe('en');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /All your photos\. One personal library\. Under your control\./i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your photo library, organized and accessible right from your browser\./i)
    ).toBeInTheDocument();

    // English DemoGallery filter + lightbox
    fireEvent.click(screen.getByRole('button', { name: 'Coast' }));
    const coastalButtons = screen.getAllByRole('button', { name: /Enlarge /i });
    expect(coastalButtons).toHaveLength(2);
    fireEvent.click(coastalButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Sample 1 \/ 2/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });

    // English DemoSearch real parser
    const searchInput = screen.getByLabelText(/Enter a demo search query/i);
    fireEvent.change(searchInput, { target: { value: 'Favorite photos 2024 Paris' } });
    expect(screen.getByText(/true \(Favorites\)/i)).toBeInTheDocument();
    expect(screen.getByText(/year 2024/i)).toBeInTheDocument();

    // English DemoPhotoEditor preset
    fireEvent.click(screen.getByRole('button', { name: 'Black & White' }));
    expect(screen.getByText(/Preview \(Black & White\)/i)).toBeInTheDocument();

    // English 4-step workflow & FAQ
    expect(
      screen.getByRole('heading', { name: /From your first photos to a well-organized library\./i })
    ).toBeInTheDocument();
    const faqSecond = screen.getByRole('button', { name: /Do I need to create an account\?/i });
    fireEvent.click(faqSecond);
    expect(faqSecond).toHaveAttribute('aria-expanded', 'true');

    // Switch back to French via header toggle
    const frBtn = screen.getByRole('button', { name: 'FR' });
    fireEvent.click(frBtn);
    expect(document.documentElement.lang).toBe('fr');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Toutes vos photos\. Une seule photothèque\. Sous votre contrôle\./i,
      })
    ).toBeInTheDocument();

    // Switch back to English via header toggle
    const enBtn = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(enBtn);
    expect(document.documentElement.lang).toBe('en');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /All your photos\. One personal library\. Under your control\./i,
      })
    ).toBeInTheDocument();

    const enYoutubeLinks = screen.getAllByRole('link', { name: /Video Tutorial|Watch on YouTube|video tutorial on YouTube/i });
    expect(enYoutubeLinks.length).toBeGreaterThanOrEqual(3);
    expect(enYoutubeLinks.every((el) => el.getAttribute('href') === 'https://www.youtube.com/watch?v=Z--ZypHe5LM')).toBe(true);

    const enYoutubeIframe = screen.getByTitle(/Gallery Pro full video tutorial on YouTube/i);
    expect(enYoutubeIframe.tagName).toBe('IFRAME');
    expect(enYoutubeIframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/Z--ZypHe5LM?rel=0');
    expect(enYoutubeIframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  });

  it('includes the YouTube tutorial link in HamburgerMenu in both French and English', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <HelpProvider>
            <HamburgerMenu isOpen={true} onClose={() => {}} />
          </HelpProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    const frMenuLink = screen.getByRole('link', { name: /Tutoriel vidéo \(YouTube\)/i });
    expect(frMenuLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Z--ZypHe5LM');
    expect(frMenuLink).toHaveAttribute('target', '_blank');

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    const enMenuLink = screen.getByRole('link', { name: /Video Tutorial \(YouTube\)/i });
    expect(enMenuLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Z--ZypHe5LM');
    expect(enMenuLink).toHaveAttribute('target', '_blank');
  });
});

