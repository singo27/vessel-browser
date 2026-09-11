import type { LocalePreference, ResolvedLocale } from "./types";

/** Map a BCP-47 / Electron locale tag onto a supported UI locale. */
export function localeFromSystemTag(systemLocale: string): ResolvedLocale {
  const normalized = systemLocale.trim().toLowerCase().replace(/_/g, "-");
  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-CN";
  }
  return "en";
}

/** Resolve a stored preference against the current system locale tag. */
export function resolveLocale(
  preference: LocalePreference | null | undefined,
  systemLocale: string,
): ResolvedLocale {
  if (preference === "en" || preference === "zh-CN") {
    return preference;
  }
  return localeFromSystemTag(systemLocale);
}
