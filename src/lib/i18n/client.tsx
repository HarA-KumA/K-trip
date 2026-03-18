import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Required languages
import ko from "../../../public/locales/ko/common.json";
import en from "../../../public/locales/en/common.json";
import ja from "../../../public/locales/ja/common.json";
import zhCN from "../../../public/locales/zh-CN/common.json";
import koTranslation from "../../../public/locales/ko/translation.json";
import enTranslation from "../../../public/locales/en/translation.json";
import jaTranslation from "../../../public/locales/ja/translation.json";
import zhCNTranslation from "../../../public/locales/zh-CN/translation.json";
import zhHK from "../../../public/locales/zh-HK/common.json";
import vi from "../../../public/locales/vi/common.json";
import th from "../../../public/locales/th/common.json";
import id from "../../../public/locales/id/common.json";
import ms from "../../../public/locales/ms/common.json";

export const STORAGE_KEY = "ktrip_lang";
const COUNTRY_COOKIE = "user_country";

export const SUPPORTED = ["ko", "en", "ja", "zh-CN", "zh-HK", "vi", "th", "id", "ms"] as const;
export type Locale = (typeof SUPPORTED)[number];

const resources = {
    "ko": { common: ko, translation: koTranslation },
    "en": { common: en, translation: enTranslation },
    "ja": { common: ja, translation: jaTranslation },
    "zh-CN": { common: zhCN, translation: zhCNTranslation },
    "zh-HK": { common: zhHK, translation: zhCNTranslation },
    "vi": { common: vi, translation: enTranslation },
    "th": { common: th, translation: enTranslation },
    "id": { common: id, translation: enTranslation },
    "ms": { common: ms, translation: enTranslation },
};

/** Utility: Check if value is a supported locale */
export function isSupportedLocale(value: any): value is Locale {
    return SUPPORTED.includes(value);
}

/** Utility: Read cookie by name */
export function readCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

/** 
 * Module-level initial detection for synchronous i18next init.
 * Prioritizes Cookie to match SSR/Middleware result for zero hydration mismatch.
 */
function getInitialLang(): Locale {
    const cookieLang = readCookie(STORAGE_KEY);
    if (isSupportedLocale(cookieLang)) return cookieLang;
    return "ko";
}

if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: getInitialLang(),
            fallbackLng: "ko",
            ns: ["common", "translation"],
            defaultNS: "common",
            interpolation: { escapeValue: false },
            react: { useSuspense: false }
        });
}

export default i18n;

/**
 * Normalizes browser language strings to supported locales.
 */
function normalizeLocale(input: string): Locale | null {
    const l = input.toLowerCase();
    if (l === 'ko' || l.startsWith('ko-')) return 'ko';
    if (l === 'ja' || l.startsWith('ja-')) return 'ja';
    if (l === 'zh-cn' || l === 'zh-sg' || l === 'zh-hans') return 'zh-CN';
    if (l === 'zh-tw' || l === 'zh-hk' || l === 'zh-mo' || l === 'zh-hant') return 'zh-HK';
    if (l === 'zh') return 'zh-CN';
    if (l === 'vi' || l.startsWith('vi-')) return 'vi';
    if (l === 'th' || l.startsWith('th-')) return 'th';
    if (l === 'id' || l.startsWith('id-')) return 'id';
    if (l === 'ms' || l.startsWith('ms-')) return 'ms';
    if (l === 'en' || l.startsWith('en-')) return 'en';
    return null;
}

/**
 * Maps country codes to preferred locales.
 */
function getLocaleFromCountry(country: string): Locale {
    const c = country.toUpperCase();
    const map: Record<string, Locale> = {
        'KR': 'ko', 'US': 'en', 'JP': 'ja', 'CN': 'zh-CN', 'HK': 'zh-HK',
        'VN': 'vi', 'TH': 'th', 'ID': 'id', 'MY': 'ms'
    };
    return map[c] || 'en';
}

/**
 * Core Logic: Determines the best locale based on priority.
 * 1. Cookie (Explicit User Choice or Middleware Resolve)
 * 2. LocalStorage (Previous User Choice)
 * 3. Browser Languages (navigator.languages)
 * 4. Country Cookie (set by middleware from IP)
 * 5. Default Fallback ('ko')
 */
export function initClientLanguage() {
    if (typeof window === "undefined") return;

    // 1. Saved choice - Cookie
    const cookieLang = readCookie(STORAGE_KEY);
    if (isSupportedLocale(cookieLang)) {
        applyLanguage(cookieLang, false);
        return;
    }

    // 2. Saved choice - LocalStorage
    const storedLang = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLocale(storedLang)) {
        applyLanguage(storedLang, true);
        return;
    }

    // 3. Browser Language
    const browserLangs = navigator.languages || [navigator.language];
    for (const bl of browserLangs) {
        const normalized = normalizeLocale(bl);
        if (normalized) {
            applyLanguage(normalized, true);
            return;
        }
    }

    // 4. Country-based detection (via cookie set by middleware)
    const country = readCookie(COUNTRY_COOKIE);
    if (country) {
        const countryLang = getLocaleFromCountry(country);
        applyLanguage(countryLang, true);
        return;
    }

    // 5. Final fallback
    applyLanguage("ko", false);
}

/**
 * Applies the language to the app state and persistence layers.
 * @param lang The locale to apply
 * @param persist Whether to update cookie/localStorage (default true)
 */
function applyLanguage(lang: string, persist = true) {
    if (!isSupportedLocale(lang)) return;

    if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
    }

    if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
        if (persist) {
            // Persist to LocalStorage
            localStorage.setItem(STORAGE_KEY, lang);
            // Persist to Cookie
            const encodedValue = encodeURIComponent(lang);
            document.cookie = `${STORAGE_KEY}=${encodedValue}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }
}

/** 
 * Public API to change language.
 * Triggers a full page reload to ensure absolute consistency across Server/Client state.
 */
export function changeLanguage(lang: string) {
    if (!isSupportedLocale(lang)) return;
    
    applyLanguage(lang, true);
    
    if (typeof window !== 'undefined') {
        // window.location.reload() is preferred over router.refresh() for i18n
        // to ensure all client-side state, providers, and HTML attributes 
        // are fully re-initialized with the new locale from the server.
        window.location.reload();
    }
}
