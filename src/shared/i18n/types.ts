export type { LocalePreference } from "../types";

/** Concrete locale after resolving `system`. */
export type ResolvedLocale = "en" | "zh-CN";

export type MessageParams = Record<string, string | number>;

export type MessageCatalog = Record<string, string>;
