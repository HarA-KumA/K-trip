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
    { code: 'ko', label: '한국어', flag: 'KR' },
    { code: 'en', label: 'English', flag: 'US' },
    { code: 'ja', label: '日本語', flag: 'JP' },
    { code: 'zh-CN', label: '简体中文', flag: 'CN' },
    { code: 'zh-HK', label: '繁體中文', flag: 'HK' },
    { code: 'vi', label: 'Tiếng Việt', flag: 'VN' },
    { code: 'th', label: 'ไทย', flag: 'TH' },
    { code: 'id', label: 'Bahasa Indonesia', flag: 'ID' },
    { code: 'ms', label: 'Bahasa Melayu', flag: 'MY' },
];

import { useTranslation } from 'react-i18next';

interface LanguagePickerProps {
    compact?: boolean;
}

export default function LanguagePicker({ compact = false }: LanguagePickerProps) {
    const { t } = useTranslation('common');
    // Dropdown open state
    const [isOpen, setIsOpen] = useState(false);

    // Default to Korean
    const [current, setCurrent] = useState<LangOption>(LANGUAGES.find(l => l.code === 'ko') || LANGUAGES[0]);

    // load saved lang from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('ktrip_lang');
        if (stored) {
            const found = LANGUAGES.find(l => l.code === stored);
            if (found) setCurrent(found);
        } else {
            // Default is Korean
            setCurrent(LANGUAGES.find(l => l.code === 'ko') || LANGUAGES[0]);
        }
    }, []);

    const handleSelect = (lang: LangOption) => {
        setCurrent(lang);
        setIsOpen(false);
        changeLanguage(lang.code);
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
