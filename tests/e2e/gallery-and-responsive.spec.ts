import { test, expect } from '@playwright/test';
import { assertNoHorizontalOverflow, resetBrowserStorage, trackAppErrors } from './helpers';

test.describe('Gallery entry, mobile navigation, and responsive layouts', () => {
  test('2.4 Accessing /gallery handles 3-step onboarding + legal acceptance cleanly and renders gallery UI', async ({
    page,
  }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/');
    await resetBrowserStorage(page);
    await page.goto('/gallery');

    // Onboarding appears on fresh IndexedDB / localStorage state
    await expect(page.getByText('Bienvenue sur Gallery Pro')).toBeVisible();
    await expect(page.getByText(/Une photothèque moderne et souveraine/i)).toBeVisible();

    // Step 1 -> Step 2 -> Step 3
    await page.getByRole('button', { name: /Suivant/i }).click();
    await expect(page.getByText(/Guide pour les utilisateurs novices/i)).toBeVisible();

    await page.getByRole('button', { name: /Suivant/i }).click();
    await expect(page.getByText(/Mentions Légales & Décharge de Responsabilité/i)).toBeVisible();

    const finishButton = page.getByRole('button', { name: /Commencer à utiliser l'application/i });
    await expect(finishButton).toBeDisabled();

    const legalCheckbox = page.getByRole('checkbox');
    await legalCheckbox.check();
    await expect(finishButton).toBeEnabled();
    await finishButton.click();

    // Modal closes and gallery controls are visible
    await expect(page.getByText('Bienvenue sur Gallery Pro')).toHaveCount(0);
    await expect(page.getByPlaceholder(/Rechercher par nom, tag, lieu, appareil/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^Toutes \(/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Favoris \(/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Avec GPS \(/ })).toBeVisible();

    // Initial sample date group renders
    await expect(page.getByText('2026-06-08')).toBeVisible();

    // Reload persists acceptance so onboarding stays dismissed
    await page.reload();
    await expect(page.getByText('Bienvenue sur Gallery Pro')).toHaveCount(0);
    await expect(page.getByPlaceholder(/Rechercher par nom, tag, lieu, appareil/i)).toBeVisible();

    tracker.assertNoAppErrors();
  });

  test('2.8 Mobile navigation drawer at 375px works without overlap or horizontal overflow', async ({ page }) => {
    const tracker = trackAppErrors(page);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Ouvrir le menu' });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Ensure primary header CTA and menu button do not overlap
    const ctaLink = page.getByRole('banner').getByRole('link', { name: /Ouvrir Gallery Pro/i });
    await expect(ctaLink).toBeVisible();
    const menuBox = await menuButton.boundingBox();
    const ctaBox = await ctaLink.boundingBox();
    expect(menuBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();
    if (menuBox && ctaBox) {
      expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(menuBox.x);
    }

    // Open mobile drawer
    await menuButton.click();
    const closeMenuButton = page.getByRole('button', { name: 'Fermer le menu' });
    await expect(closeMenuButton).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = page.getByRole('navigation', { name: 'Menu mobile' });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Fonctionnalités' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Démo' })).toBeVisible();

    // Selecting a section link closes the drawer and scrolls to section
    await mobileNav.getByRole('link', { name: 'Démo' }).click();
    await expect(mobileNav).toHaveCount(0);
    await expect(page.locator('#demo')).toBeVisible();

    await assertNoHorizontalOverflow(page);
    tracker.assertNoAppErrors();
  });

  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1366, height: 900 },
  ] as const;

  for (const vp of viewports) {
    test(`2.9 Responsive layout check on ${vp.name} (${vp.width}px) across /, /en, and /gallery`, async ({
      page,
    }) => {
      const tracker = trackAppErrors(page);

      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Accept legal modal up-front only for /gallery view test cleanly via UI on first check or seeded state
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('#demo-galerie')).toBeVisible();
      await assertNoHorizontalOverflow(page);

      await page.goto('/en');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('link', { name: /Launch Gallery Pro/i })).toBeVisible();
      await assertNoHorizontalOverflow(page);

      await page.evaluate(() => {
        window.localStorage.setItem('gallery_pro_legal_accepted', 'true');
        window.localStorage.setItem('gallery_pro_lang', 'en');
      });
      await page.goto('/gallery');
      await expect(page.getByPlaceholder(/Search by name, tag, location, camera/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /^All \(/ })).toBeVisible();
      await assertNoHorizontalOverflow(page);

      tracker.assertNoAppErrors();
    });
  }
});
