import { test, expect } from '@playwright/test';
import { trackAppErrors } from './helpers';

test.describe('Landing interactive demonstrations', () => {
  test('2.5 DemoGallery filters samples and supports keyboard & mouse lightbox navigation', async ({ page }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/');
    const demoGallery = page.locator('#demo-galerie');
    await demoGallery.scrollIntoViewIfNeeded();
    await expect(demoGallery).toBeVisible();

    // 8 bundled demo images initially visible
    const allThumbs = demoGallery.getByRole('button', { name: /^Agrandir / });
    await expect(allThumbs).toHaveCount(8);

    // Filter by "Littoral"
    const coastFilter = demoGallery.getByRole('button', { name: 'Littoral' });
    await coastFilter.click();
    await expect(coastFilter).toHaveAttribute('aria-pressed', 'true');
    const filteredThumbs = demoGallery.getByRole('button', { name: /^Agrandir / });
    await expect(filteredThumbs).toHaveCount(2);

    // Open lightbox from keyboard focus + Enter
    const firstThumb = filteredThumbs.first();
    await firstThumb.focus();
    await expect(firstThumb).toBeFocused();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Exemple 1 \/ 2/i)).toBeVisible();
    await expect(dialog.getByText(/Date EXIF/i)).toBeVisible();

    // Navigate with ArrowRight and ArrowLeft keys
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText(/Exemple 2 \/ 2/i)).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText(/Exemple 1 \/ 2/i)).toBeVisible();

    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    // Ensure keyboard focus remains usable after closing the dialog
    await coastFilter.focus();
    await expect(coastFilter).toBeFocused();

    tracker.assertNoAppErrors();
  });

  test('2.6 DemoSearch executes local natural query parser, presets, custom input, and empty/zero-match cases', async ({
    page,
  }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/');
    const demoSearch = page.locator('#demo-recherche');
    await demoSearch.scrollIntoViewIfNeeded();

    const searchInput = demoSearch.getByLabel(/Saisir une requête de recherche de démonstration/i);
    await expect(searchInput).toBeVisible();

    // Click preset chip "Photos de plage avec GPS"
    await demoSearch.getByRole('button', { name: /Photos de plage avec GPS/i }).click();
    await expect(searchInput).toHaveValue('Photos de plage avec GPS');
    await expect(demoSearch.getByText('true (Avec GPS)')).toBeVisible();
    await expect(demoSearch.getByText(/plage · mer/i)).toBeVisible();

    // Type custom natural query
    await searchInput.fill('Coups de cœur 2024 à Paris');
    await expect(demoSearch.getByText('true (Favoris)')).toBeVisible();
    await expect(demoSearch.getByText('année 2024')).toBeVisible();
    await expect(demoSearch.getByText(/^paris$/i)).toBeVisible();

    // Zero-match blurry query case
    await demoSearch.getByRole('button', { name: /Photos floues/i }).click();
    await expect(demoSearch.getByText('true (Flou détecté)')).toBeVisible();
    await expect(demoSearch.getByText('0 / 8')).toBeVisible();
    await expect(demoSearch.getByText(/variance du Laplacien est inférieure à 120/i)).toBeVisible();

    // Empty input prompt
    await demoSearch.getByRole('button', { name: 'Effacer' }).click();
    await expect(searchInput).toHaveValue('');
    await expect(demoSearch.getByText(/Saisissez un mot-clé/i)).toBeVisible();

    tracker.assertNoAppErrors();
  });

  test('2.7 DemoPhotoEditor updates visual split clipPath, slider percentage, and preset filters', async ({ page }) => {
    const tracker = trackAppErrors(page);

    await page.goto('/');
    const demoEditor = page.locator('#demo-retouche');
    await demoEditor.scrollIntoViewIfNeeded();
    await expect(demoEditor).toBeVisible();

    const beforeImageWrapper = demoEditor.locator('div[style*="clip-path"]').first();
    await expect(beforeImageWrapper).toHaveCSS('clip-path', /inset\(0px 48% 0px 0px\)|inset\(0 48% 0 0\)/);

    const slider = demoEditor.getByRole('slider', { name: /Curseur de comparaison avant\/après/i });
    await slider.fill('80');
    await expect(demoEditor.getByText('80%')).toBeVisible();
    await expect(beforeImageWrapper).toHaveCSS('clip-path', /inset\(0px 20% 0px 0px\)|inset\(0 20% 0 0\)/);

    // Switch filter preset to Noir et blanc
    const bwPreset = demoEditor.getByRole('button', { name: 'Noir et blanc' });
    await bwPreset.click();
    await expect(bwPreset).toHaveAttribute('aria-pressed', 'true');
    await expect(demoEditor.getByText('Prévisualisation (Noir et blanc)')).toBeVisible();
    await expect(demoEditor.getByText(/Monochrome · Contraste \+15 %/i)).toBeVisible();

    const afterImage = demoEditor.getByAltText(/Aperçu démonstration de filtre appliqué/i);
    await expect(afterImage).toHaveCSS('filter', /grayscale\(1\)|grayscale\(100%\)/);

    tracker.assertNoAppErrors();
  });
});
