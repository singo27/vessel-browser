import { createSignal } from "solid-js";
import {
  resolveLocale,
  t as translate,
  type LocalePreference,
  type MessageParams,
  type ResolvedLocale,
} from "../../../shared/i18n";

const [locale, setLocale] = createSignal<ResolvedLocale>(
  resolveLocale("system", typeof navigator !== "undefined" ? navigator.language : "en"),
);

let initialized = false;

function applyPreference(preference: LocalePreference | null | undefined): void {
  const systemTag = typeof navigator !== "undefined" ? navigator.language : "en";
  setLocale(resolveLocale(preference ?? "system", systemTag));
  try {
    localStorage.setItem("vessel:locale", preference ?? "system");
  } catch {
    /* ignore quota / private mode */
  }
}

/** Bootstrap locale from settings; safe to call multiple times. */
export function initI18n(): void {
  if (initialized) return;
  initialized = true;

  try {
    const cached = localStorage.getItem("vessel:locale") as LocalePreference | null;
    if (cached === "system" || cached === "en" || cached === "zh-CN") {
      applyPreference(cached);
    }
  } catch {
    /* ignore */
  }

  if (typeof window === "undefined") return;

  void window.vessel?.settings
    ?.get()
    .then((settings) => {
      applyPreference(settings.locale);
    })
    .catch(() => {
      /* settings unavailable during early bootstrap */
    });

  window.vessel?.settings?.onUpdate?.((settings) => {
    applyPreference(settings.locale);
  });
}

initI18n();

export function t(key: string, params?: MessageParams): string {
  return translate(locale(), key, params);
}

export function useI18n() {
  return {
    locale,
    t,
  };
}
