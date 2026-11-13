import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

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

  const renderLanding = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>
    );

  it('renders the hero value proposition, primary app CTA (/gallery), and GitHub link without app onboarding popup', () => {
    renderLanding();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Toutes vos photos\. Une seule photothèque\. Sous votre contrôle\./i,
      })
    ).toBeInTheDocument();

    const appLinks = screen.getAllByRole('link', {
      name: /Ouvrir Gallery Pro|Découvrir Gallery Pro|Accéder à Gallery Pro/i,
    });
    expect(appLinks.length).toBeGreaterThanOrEqual(2);
    expect(appLinks.every((el) => el.getAttribute('href') === '/gallery')).toBe(true);

    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
    expect(githubLinks.length).toBeGreaterThanOrEqual(2);
    expect(githubLinks.some((el) => el.getAttribute('href') === 'https://github.com/nouhailler/photorapp')).toBe(true);

    // Public visitors must NOT see the legal onboarding modal overlay
    expect(screen.queryByText(/Mentions légales et responsabilité/i)).not.toBeInTheDocument();
  });

  it('runs the real local natural search parser when switching sample queries', () => {
    renderLanding();

    // Default sample: "Montagnes en hiver" -> month 1
    expect(screen.getByText(/^mois 1$/i)).toBeInTheDocument();

    // Switch to GPS query
    fireEvent.click(screen.getByRole('button', { name: /« Photos de plage avec GPS »/i }));
    expect(screen.getByText(/true \(Avec GPS\)/i)).toBeInTheDocument();

    // Switch to blurry photos query
    fireEvent.click(screen.getByRole('button', { name: /« Photos floues »/i }));
    expect(screen.getByText(/true \(Flou détecté\)/i)).toBeInTheDocument();
  });

  it('updates before/after preview label when clicking editor preset buttons', () => {
    renderLanding();

    expect(screen.getByText(/Prévisualisation \(Vivid\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Noir & Blanc' }));
    expect(screen.getByText(/Prévisualisation \(Noir & Blanc\)/i)).toBeInTheDocument();
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
});
