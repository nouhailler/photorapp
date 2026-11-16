import { test, expect } from '@playwright/test';
import { assertNoHorizontalOverflow, resetBrowserStorage, trackAppErrors } from './helpers';

test.describe('Landing pages (FR / EN) & language persistence', () => {
  test('2.1 French landing page (/) loads with hero, CTAs, main sections, and zero app errors', async ({ page }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Toutes vos photos\. Une seule photothèque\. Sous votre contrôle\./i,
      })
    ).toBeVisible();

    const primaryCta = page.getByRole('link', { name: /Découvrir Gallery Pro/i });
    const secondaryCta = page.getByRole('link', { name: /Voir les démonstrations/i });
    await expect(primaryCta).toHaveAttribute('href', '/gallery');
    await expect(secondaryCta).toHaveAttribute('href', '#demo');

    // Navigate via anchor links to main sections
    await secondaryCta.click();
    await expect(page.locator('#demo')).toBeVisible();

    await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'FAQ' }).click();
    await expect(page.locator('#faq')).toBeVisible();

    // Ensure legal onboarding modal does NOT appear on public landing page
    await expect(page.getByText(/Mentions Légales & Décharge de Responsabilité/i)).toHaveCount(0);

    await assertNoHorizontalOverflow(page);
    tracker.assertNoAppErrors();
  });

  test('2.2 English landing page (/en) loads directly with translated content', async ({ page }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /All your photos\. One personal library\. Under your control\./i,
      })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: /Launch Gallery Pro/i })).toHaveAttribute('href', '/gallery');
    await expect(page.getByRole('link', { name: /Explore interactive demos/i })).toHaveAttribute('href', '#demo');
    await expect(page.getByRole('link', { name: /Open Gallery Pro/i }).first()).toHaveAttribute('href', '/gallery');

    // Verify no residual French hero/footer copy appears on main English sections
    await expect(page.getByText(/Toutes vos photos\. Une seule photothèque\./i)).toHaveCount(0);
    await expect(page.getByText(/Votre photothèque, organisée et accessible depuis votre navigateur\./i)).toHaveCount(0);

    await assertNoHorizontalOverflow(page);
    tracker.assertNoAppErrors();
  });

  test('2.3 Language switcher updates route, localStorage, persists on reload, and carries into /gallery', async ({ page }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/');
    await resetBrowserStorage(page);
    await page.reload();

    const langGroup = page.getByRole('group', { name: /Choisir la langue|Choose language/i });
    await expect(langGroup.getByRole('button', { name: 'FR' })).toHaveAttribute('aria-pressed', 'true');

    // Switch FR -> EN
    await langGroup.getByRole('button', { name: 'EN' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /All your photos\. One personal library\. Under your control\./i,
      })
    ).toBeVisible();
    expect(await page.evaluate(() => window.localStorage.getItem('gallery_pro_lang'))).toBe('en');

    // Reload /en and confirm English persists
    await page.reload();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.evaluate(() => window.localStorage.getItem('gallery_pro_lang'))).toBe('en');

    // Switch EN -> FR
    await page
      .getByRole('group', { name: /Choisir la langue|Choose language/i })
      .getByRole('button', { name: 'FR' })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Toutes vos photos\. Une seule photothèque\. Sous votre contrôle\./i,
      })
    ).toBeVisible();
    expect(await page.evaluate(() => window.localStorage.getItem('gallery_pro_lang'))).toBe('fr');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    // Navigate from /en to /gallery and verify app stays in English
    await page.goto('/en');
    await page.getByRole('link', { name: /Open Gallery Pro/i }).first().click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('Welcome to Gallery Pro')).toBeVisible();

    tracker.assertNoAppErrors();
  });
});
