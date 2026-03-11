import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Required languages
import ko from "../../../public/locales/ko/common.json";
import en from "../../../public/locales/en/common.json";
import ja from "../../../public/locales/ja/common.json";
import zhCN from "../../../public/locales/zh-CN/common.json";
import zhHK from "../../../public/locales/zh-HK/common.json";
import vi from "../../../public/locales/vi/common.json";
import th from "../../../public/locales/th/common.json";
import id from "../../../public/locales/id/common.json";
import ms from "../../../public/locales/ms/common.json";

const STORAGE_KEY = "ktrip_lang";
const SUPPORTED = ["ko", "en", "ja", "zh-CN", "zh-HK", "vi", "th", "id", "ms"];

const resources = {
    "ko": { common: ko },
    "en": { common: en },
    "ja": { common: ja },
    "zh-CN": { common: zhCN },
    "zh-HK": { common: zhHK },
    "vi": { common: vi },
    "th": { common: th },
    "id": { common: id },
    "ms": { common: ms },
};

// ────────────────────────────────────────────────────────────
// Extract locale synchronously from document.cookie so that
// the very first client render matches the SSR render exactly.
// ────────────────────────────────────────────────────────────
let initialLang = "en";
if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )ktrip_lang=([^;]*)/);
    if (match && match[1] && SUPPORTED.includes(match[1])) {
        initialLang = match[1];
    }
}

if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLang,
            fallbackLng: "en",
            ns: ["common"],
            defaultNS: "common",
            interpolation: { escapeValue: false },
        });
}

export default i18n;

/**
 * Switch to the user's preferred language after hydration.
 * Still useful if cookie was missing initially.
 */
export function initClientLanguage() {
    if (typeof window === "undefined") return;

    // Check cookie
    const match = document.cookie.match(/(?:^|; )ktrip_lang=([^;]*)/);
    if (match && match[1] && SUPPORTED.includes(match[1])) {
        applyLanguage(match[1]);
        return;
    }

    applyLanguage("en");
}


function getLocaleFromBrowser(browserLang: string): string | null {
    const l = browserLang.toLowerCase();
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

function getLocaleFromCountry(country: string): string {
    const c = country.toUpperCase();
    const map: Record<string, string> = {
        'KR': 'ko',
        'US': 'en',
        'JP': 'ja',
        'CN': 'zh-CN',
        'HK': 'zh-HK',
        'VN': 'vi',
        'TH': 'th',
        'ID': 'id',
        'MY': 'ms'
    };
    return map[c] || 'en';
}

function applyLanguage(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = lang;
}

/** Change language and persist */
export function changeLanguage(lang: string) {
    applyLanguage(lang);
    if (typeof window !== 'undefined') {
        window.location.reload();
    }
}
