import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Existing languages
import en from "../../../public/locales/en/common.json";
import ko from "../../../public/locales/ko/common.json";
import jp from "../../../public/locales/jp/common.json";
import cn from "../../../public/locales/cn/common.json";
import tw from "../../../public/locales/tw/common.json";
import es from "../../../public/locales/es/common.json";
import fr from "../../../public/locales/fr/common.json";
import de from "../../../public/locales/de/common.json";

// New languages
import th from "../../../public/locales/th/common.json";
import vi from "../../../public/locales/vi/common.json";
import ar from "../../../public/locales/ar/common.json";
import id from "../../../public/locales/id/common.json";
import ms from "../../../public/locales/ms/common.json";
import pt from "../../../public/locales/pt/common.json";
import ru from "../../../public/locales/ru/common.json";

const STORAGE_KEY = "ktrip_lang";
const SUPPORTED = ["en", "ko", "jp", "cn", "tw", "es", "fr", "de", "th", "vi", "ar", "id", "ms", "pt", "ru"];

const resources = {
    en: { common: en },
    ko: { common: ko },
    jp: { common: jp },
    cn: { common: cn },
    tw: { common: tw },
    es: { common: es },
    fr: { common: fr },
    de: { common: de },
    th: { common: th },
    vi: { common: vi },
    ar: { common: ar },
    id: { common: id },
    ms: { common: ms },
    pt: { common: pt },
    ru: { common: ru },
};

// ────────────────────────────────────────────────────────────
// IMPORTANT: Always initialize with "en" so SSR and the first
// client render both produce identical HTML (no hydration mismatch).
// The real user language is applied AFTER hydration via
// `initClientLanguage()` which is called in a useEffect.
// ────────────────────────────────────────────────────────────
if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: "en",          // ← always "en" for SSR match
            fallbackLng: "en",
            ns: ["common"],
            defaultNS: "common",
            interpolation: { escapeValue: false },
        });
}

export default i18n;

/**
 * Call this inside a useEffect (client-only) to switch to the
 * user's preferred language after hydration is complete.
 */
export function initClientLanguage() {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) {
        applyLanguage(stored);
        return;
    }

    // Detect browser language
    let detected = 'ko'; // Default fallback
    if (navigator.language) {
        const browserLang = navigator.language.split('-')[0].toLowerCase();

        // Handle specific variations like zh-CN, zh-TW, etc.
        const fullLang = navigator.language;
        if (fullLang === 'zh-CN' || fullLang === 'zh' || browserLang === 'zh') {
            detected = 'cn';
        } else if (fullLang === 'zh-TW' || fullLang === 'zh-HK') {
            detected = 'tw';
        } else if (browserLang === 'ja') {
            detected = 'jp';
        } else if (SUPPORTED.includes(browserLang)) {
            detected = browserLang;
        }
    }

    applyLanguage(detected);
}

function applyLanguage(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
}

/** Change language and persist (for use in UI pickers) */
export function changeLanguage(lang: string) {
    applyLanguage(lang);
    if (typeof window !== 'undefined') {
        window.location.reload();
    }
}
