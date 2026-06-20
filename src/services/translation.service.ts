import { Injectable, signal } from '@angular/core';
import { Lang, TRANSLATIONS } from '../i18n/translations';

/**
 * App-wide i18n. Holds the active language as a signal so the UI re-renders on
 * change, and persists the choice to localStorage (SSR-safe). Look-ups fall
 * back to English, then to the key itself, so a missing key is never fatal.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private static readonly STORAGE_KEY = 'devhub.lang';

  private readonly _lang = signal<Lang>(this._readStoredLang());
  /** Reactive current language. Read as a signal: `i18n.lang()`. */
  readonly lang = this._lang.asReadonly();

  setLang(lang: Lang): void {
    this._lang.set(lang);
    this._persistLang(lang);
  }

  /** Flip between the two supported languages. */
  toggle(): void {
    this.setLang(this._lang() === 'en' ? 'el' : 'en');
  }

  /**
   * Translate `key` for the active language. `{placeholder}` tokens in the
   * resolved string are substituted from `params`.
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this._lang();
    const text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_match, name) =>
      params[name] != null ? String(params[name]) : `{${name}}`,
    );
  }

  /** sessionStorage/localStorage are unavailable during SSR and may throw. */
  private _readStoredLang(): Lang {
    if (typeof window === 'undefined') return 'en';
    try {
      const stored = window.localStorage.getItem(TranslationService.STORAGE_KEY);
      return stored === 'el' || stored === 'en' ? stored : 'en';
    } catch {
      return 'en';
    }
  }

  private _persistLang(lang: Lang): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(TranslationService.STORAGE_KEY, lang);
    } catch {
      // Storage disabled (e.g. private mode); keep the in-memory signal only.
    }
  }
}
