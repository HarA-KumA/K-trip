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

// New languages (2024 Korea inbound tourism data-based)
import th from "../../../public/locales/th/common.json";
import vi from "../../../public/locales/vi/common.json";
import ar from "../../../public/locales/ar/common.json";
import id from "../../../public/locales/id/common.json";
import pt from "../../../public/locales/pt/common.json";
import ms from "../../../public/locales/ms/common.json";
import ru from "../../../public/locales/ru/common.json";

const STORAGE_KEY = "ktrip_lang";
const SUPPORTED = ["en", "ko", "jp", "cn", "tw", "es", "fr", "de", "th", "vi", "ar", "id", "pt", "ms", "ru"];

const resources = {
    en: { translation: en },
    ko: { translation: ko },
    jp: { translation: jp },
    cn: { translation: cn },
    tw: { translation: tw },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    th: { translation: th },
    vi: { translation: vi },
    ar: { translation: ar },
    id: { translation: id },
    pt: { translation: pt },
    ms: { translation: ms },
    ru: { translation: ru },
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

    // 테스트사이트 요청: 브라우저 언어 무시하고 기본 언어를 한국어(ko)로 설정
    const detected = "ko";
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
}
