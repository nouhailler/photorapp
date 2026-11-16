import { expect, type Page } from '@playwright/test';

const ALLOWED_THIRD_PARTY_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://tile.openstreetmap.org',
  'https://lh3.googleusercontent.com',
  'https://images.unsplash.com',
];

function isNonEssentialThirdPartyNetworkMessage(text: string, locationUrl?: string): boolean {
  if (locationUrl && ALLOWED_THIRD_PARTY_ORIGINS.some((origin) => locationUrl.startsWith(origin))) {
    return true;
  }

  // Browser logs generic "Failed to load resource: net::ERR_FAILED" when an external
  // font/tile/sample image fails in offline/sandboxed CI environments.
  if (
    text.includes('Failed to load resource') &&
    (!locationUrl || ALLOWED_THIRD_PARTY_ORIGINS.some((origin) => locationUrl.startsWith(origin)))
  ) {
    return true;
  }

  return ALLOWED_THIRD_PARTY_ORIGINS.some((origin) => text.includes(origin));
}

export interface AppErrorTracker {
  pageErrors: string[];
  appConsoleErrors: string[];
  ignoredThirdPartyErrors: string[];
  assertNoAppErrors: () => void;
}

/**
 * Tracks unhandled JS exceptions (`pageerror`) and first-party console errors,
 * while separating non-essential third-party asset load failures (fonts, OSM tiles, sample URLs).
 */
export function trackAppErrors(page: Page): AppErrorTracker {
  const pageErrors: string[] = [];
  const appConsoleErrors: string[] = [];
  const ignoredThirdPartyErrors: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.message || String(error));
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const locationUrl = msg.location()?.url;

    if (isNonEssentialThirdPartyNetworkMessage(text, locationUrl)) {
      ignoredThirdPartyErrors.push(`${text}${locationUrl ? ` (${locationUrl})` : ''}`);
      return;
    }

    appConsoleErrors.push(`${text}${locationUrl ? ` (${locationUrl})` : ''}`);
  });

  return {
    pageErrors,
    appConsoleErrors,
    ignoredThirdPartyErrors,
    assertNoAppErrors: () => {
      expect(pageErrors, `Unhandled page errors: ${pageErrors.join(' | ')}`).toEqual([]);
      expect(
        appConsoleErrors,
        `Unexpected application console errors: ${appConsoleErrors.join(' | ')}`
      ).toEqual([]);
    },
  };
}

/**
 * Clears localStorage, sessionStorage, and IndexedDB GalleryProDB for deterministic fresh-state tests.
 */
export async function resetBrowserStorage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    if ('indexedDB' in window) {
      await new Promise<void>((resolve) => {
        const req = window.indexedDB.deleteDatabase('GalleryProDB');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    }
  });
}

/**
 * Asserts zero horizontal overflow on the active viewport.
 */
export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    dimensions.scrollWidth,
    `Horizontal overflow detected: scrollWidth (${dimensions.scrollWidth}) > clientWidth (${dimensions.clientWidth})`
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}
