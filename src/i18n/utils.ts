import { translations, type Locale, type TranslationKey } from "./translations";

/**
 * 根据当前路径检测语言
 */
export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith("/me/en/") || pathname.startsWith("/me/en")
    ? "en"
    : "zh";
}

/**
 * 获取翻译文本
 */
export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

/**
 * 获取语言切换的目标 URL
 */
export function getLangSwitchUrl(
  currentPath: string,
  currentLocale: Locale
): string {
  const pathWithoutBase = currentPath.replace(/^\/me/, "");
  if (currentLocale === "zh") {
    return `/me/en${pathWithoutBase}`;
  } else {
    return `/me${pathWithoutBase.replace(/^\/en/, "")}`;
  }
}

/**
 * 根据 locale 生成正确的路径
 */
export function localizedPath(
  base: string,
  path: string,
  locale: Locale
): string {
  if (locale === "en") {
    return `${base}en/${path}`;
  }
  return `${base}${path}`;
}
