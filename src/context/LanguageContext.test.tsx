import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from './LanguageContext';
import { useLanguage } from './useLanguage';
import { APP_LANG_STORAGE_KEY } from './languageContextDef';

const ProbeComponent = () => {
  const { lang, isEn, setLang, toggleLang } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="isEn">{String(isEn)}</span>
      <button onClick={() => setLang('en')}>Set EN</button>
      <button onClick={() => setLang('fr')}>Set FR</button>
      <button onClick={toggleLang}>Toggle</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'fr';
    window.history.replaceState({}, '', '/');
  });

  it('defaults to French when no localStorage key or /en path is set', () => {
    render(
      <LanguageProvider>
        <ProbeComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('fr');
    expect(screen.getByTestId('isEn').textContent).toBe('false');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('initializes to English when localStorage has "en" persisted', () => {
    window.localStorage.setItem(APP_LANG_STORAGE_KEY, 'en');

    render(
      <LanguageProvider>
        <ProbeComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('isEn').textContent).toBe('true');
    expect(document.documentElement.lang).toBe('en');
  });

  it('initializes to English when entering via /en route', () => {
    window.history.replaceState({}, '', '/en');

    render(
      <LanguageProvider>
        <ProbeComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('isEn').textContent).toBe('true');
    expect(document.documentElement.lang).toBe('en');
  });

  it('updates and persists language via setLang and toggleLang', () => {
    const spySetItem = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <LanguageProvider>
        <ProbeComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Set EN'));
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('isEn').textContent).toBe('true');
    expect(window.localStorage.getItem(APP_LANG_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');

    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('lang').textContent).toBe('fr');
    expect(screen.getByTestId('isEn').textContent).toBe('false');
    expect(window.localStorage.getItem(APP_LANG_STORAGE_KEY)).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');

    expect(spySetItem).toHaveBeenCalledWith(APP_LANG_STORAGE_KEY, 'en');
    expect(spySetItem).toHaveBeenCalledWith(APP_LANG_STORAGE_KEY, 'fr');
    spySetItem.mockRestore();
  });
});
