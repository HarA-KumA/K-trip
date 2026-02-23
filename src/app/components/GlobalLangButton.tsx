'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LanguagePicker from './LanguagePicker';
import styles from './GlobalLangButton.module.css';
import { initClientLanguage } from '@/lib/i18n/client';

/**
 * Floating language selector — visible on all pages.
 * Also responsible for calling initClientLanguage() after hydration
 * so SSR and client render start with the same language ("en"),
 * then switch to the user's saved language after mount.
 */
export default function GlobalLangButton() {
    const pathname = usePathname();

    // Apply user's saved/browser language AFTER hydration completes
    useEffect(() => {
        initClientLanguage();
    }, []);

    // auth 페이지에선 숨김
    if (pathname.startsWith('/auth')) return null;

    return (
        <div className={styles.floatWrap}>
            <LanguagePicker compact />
        </div>
    );
}
