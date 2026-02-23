'use client';

import { useState, useEffect } from 'react';
import { changeLanguage } from '@/lib/i18n/client';
import styles from './LanguagePicker.module.css';

export interface LangOption {
    code: string;
    label: string;
    flag: string;
}

export const LANGUAGES: LangOption[] = [
    // Column 1
    { code: 'en-AU', label: 'English (Australia)', flag: '🇦🇺' },
    { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
    { code: 'en-PH', label: 'English (Philippines)', flag: '🇵🇭' },
    { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'ms', label: 'Bahasa Malaysia', flag: '🇲🇾' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },

    // Column 2
    { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦' },
    { code: 'en-MY', label: 'English (Malaysia)', flag: '🇲🇾' },
    { code: 'en-SG', label: 'English (Singapore)', flag: '🇸🇬' },
    { code: 'en', label: 'English (International)', flag: '🌐' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },

    // Column 3
    { code: 'en-HK', label: 'English (Hong Kong, SAR)', flag: '🇭🇰' },
    { code: 'en-NZ', label: 'English (New Zealand)', flag: '🇳🇿' },
    { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'es', label: 'Español (España)', flag: '🇪🇸' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

// 언어코드 → i18n 키 매핑 (실제 지원하는 키로 라우팅)
const LANG_MAP: Record<string, string> = {
    'zh-CN': 'cn', 'zh-TW': 'tw', 'ja': 'jp', 'ko': 'ko', 'en': 'en',
    'en-AU': 'en', 'en-CA': 'en', 'en-HK': 'en', 'en-IN': 'en',
    'en-MY': 'en', 'en-NZ': 'en', 'en-PH': 'en', 'en-SG': 'en',
    'en-US': 'en', 'en-GB': 'en',
    'th': 'th', 'vi': 'vi', 'ms': 'ms', 'fr': 'fr', 'es': 'es',
    'de': 'de', 'it': 'en', 'ru': 'ru', 'nl': 'en', 'id': 'id', 'tl': 'en',
    'ar': 'ar', 'pt': 'pt'
};

function toI18nKey(code: string) {
    return LANG_MAP[code] ?? 'en';
}

import { useTranslation } from 'react-i18next';

interface LanguagePickerProps {
    compact?: boolean;
}

export default function LanguagePicker({ compact = false }: LanguagePickerProps) {
    const { t } = useTranslation('common');
    // Dropdown open state
    const [isOpen, setIsOpen] = useState(false);

    // Default to Korean
    const [current, setCurrent] = useState<LangOption>(LANGUAGES.find(l => l.code === 'ko') || LANGUAGES[14]);

    // load saved lang from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('ktrip_lang');
        if (stored) {
            const found = LANGUAGES.find(l => toI18nKey(l.code) === stored || l.code === stored);
            if (found) setCurrent(found);
        } else {
            // Default is Korean as requested
            setCurrent(LANGUAGES.find(l => l.code === 'ko') || LANGUAGES[14]);
        }
    }, []);

    const handleSelect = (lang: LangOption) => {
        setCurrent(lang);
        setIsOpen(false);
        const i18nKey = toI18nKey(lang.code);
        changeLanguage(i18nKey);
    };

    return (
        <div className={styles.wrapper}>
            <button
                className={`${styles.trigger} ${compact ? styles.compact : ''}`}
                onClick={() => setIsOpen(v => !v)}
                title="Select Language"
            >
                <span className={styles.flag}>{current.flag}</span>
                {!compact && <span className={styles.langLabel}>{current.label}</span>}
                <span className={styles.chevron}>{isOpen ? '▲' : '▾'}</span>
            </button>

            {isOpen && (
                <>
                    <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <h2>{t('common.select_language', { defaultValue: 'Select Language' })}</h2>
                        </div>
                        <div className={styles.langList}>
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`${styles.langItem} ${current.code === lang.code ? styles.active : ''}`}
                                    onClick={() => handleSelect(lang)}
                                >
                                    <span className={styles.itemFlag}>{lang.flag}</span>
                                    <span className={styles.itemLabel}>{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
