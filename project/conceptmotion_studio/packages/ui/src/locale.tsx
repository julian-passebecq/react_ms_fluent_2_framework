import {
  Button,
} from '@fluentui/react-components';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  commonUiStrings,
  DEFAULT_LOCALE_STORAGE_KEY,
  readStoredLocale,
  resolveLocalizedText,
  writeStoredLocale,
} from './locale-helpers';
import type {
  CommonUiStringKey,
  Locale,
  LocaleStorage,
  LocalizedText,
} from './locale-helpers';
import { mergeClassNames } from './internal';

export interface LocaleContextValue {
  locale: Locale;
  setLocale(locale: Locale): void;
  resolve(value: LocalizedText | null | undefined): string;
  t(key: CommonUiStringKey): string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function getBrowserStorage(): LocaleStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  storageKey?: string;
  storage?: LocaleStorage | null;
  onLocaleChange?: (locale: Locale) => void;
}

export function LocaleProvider({
  children,
  initialLocale = 'en',
  storageKey = DEFAULT_LOCALE_STORAGE_KEY,
  storage,
  onLocaleChange,
}: LocaleProviderProps) {
  const resolvedStorage = storage === undefined ? getBrowserStorage() : storage ?? undefined;
  const [locale, setLocaleState] = useState<Locale>(() =>
    readStoredLocale(resolvedStorage, storageKey, initialLocale),
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      writeStoredLocale(resolvedStorage, nextLocale, storageKey);
      onLocaleChange?.(nextLocale);
    },
    [onLocaleChange, resolvedStorage, storageKey],
  );

  useEffect(() => {
    if (storage !== undefined || typeof window === 'undefined') return undefined;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      const nextLocale = readStoredLocale(window.localStorage, storageKey, locale);
      if (nextLocale !== locale) setLocaleState(nextLocale);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [locale, storage, storageKey]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      resolve: (text) => resolveLocalizedText(text, locale),
      t: (key) => resolveLocalizedText(commonUiStrings[key], locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider.');
  return context;
}

export function useLocalizedText(value: LocalizedText | null | undefined): string {
  return useLocale().resolve(value);
}

export interface LanguageToggleProps {
  className?: string;
  hidden?: boolean;
  label?: LocalizedText;
  showLabel?: boolean;
}

export function LanguageToggle({
  className,
  hidden = false,
  label,
  showLabel = false,
}: LanguageToggleProps) {
  const { locale, setLocale, resolve, t } = useLocale();
  if (hidden) return null;

  const accessibleLabel = resolve(label) || t('language');
  return (
    <div
      className={mergeClassNames('dp-language-toggle', className)}
      role="group"
      aria-label={accessibleLabel}
    >
      {showLabel ? <span className="dp-language-toggle__label">{accessibleLabel}</span> : null}
      <Button
        appearance={locale === 'en' ? 'primary' : 'subtle'}
        size="small"
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </Button>
      <Button
        appearance={locale === 'no' ? 'primary' : 'subtle'}
        size="small"
        type="button"
        aria-pressed={locale === 'no'}
        onClick={() => setLocale('no')}
      >
        NO
      </Button>
    </div>
  );
}
