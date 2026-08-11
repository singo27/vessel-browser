import { en } from "./en";
import { zhCN } from "./zh-CN";
import type { MessageCatalog, MessageParams, ResolvedLocale } from "./types";

const catalogs: Record<ResolvedLocale, MessageCatalog> = {
  en,
  "zh-CN": zhCN,
};

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/** Look up a message for a resolved locale, falling back to English. */
export function t(locale: ResolvedLocale, key: string, params?: MessageParams): string {
  const primary = catalogs[locale]?.[key];
  const fallback = catalogs.en[key];
  const template = primary ?? fallback ?? key;
  return interpolate(template, params);
}

export function getCatalog(locale: ResolvedLocale): MessageCatalog {
  return catalogs[locale] ?? catalogs.en;
}
