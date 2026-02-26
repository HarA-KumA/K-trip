"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";
import { useTranslation } from "react-i18next";

export default function SignupPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Find selected language code
        const selectedLang = LANGUAGES.find(l => l.code === countryCode);
        const i18nKey = selectedLang ? toI18nKey(selectedLang.code) : 'en';

        // Mock Signup
        setTimeout(() => {
            // Save user name and language preference
            localStorage.setItem(`signup_name_${email}`, name);
            localStorage.setItem(`ktrip_lang`, i18nKey); // Persist language choice

            // Redirect to login
            router.push('/auth/login');
        }, 1000);
    };

    // Country selection mapping (Helper)
    function toI18nKey(code: string) {
        const LANG_MAP: Record<string, string> = {
            'ko': 'ko', 'en': 'en', 'ja': 'jp', 'zh-CN': 'cn', 'zh-TW': 'tw',
            'vi': 'vi', 'th': 'th', 'id': 'id', 'ms': 'ms'
        };
        return LANG_MAP[code] ?? 'en';
    }

    const LANGUAGES = [
        { code: 'ko', label: 'South Korea', flag: '🇰🇷' },
        { code: 'en', label: 'United States / Global', flag: '🇺🇸' },
        { code: 'ja', label: 'Japan', flag: '🇯🇵' },
        { code: 'zh-CN', label: 'China', flag: '🇨🇳' },
        { code: 'zh-TW', label: 'Taiwan / HK', flag: '🇭🇰' },
        { code: 'vi', label: 'Vietnam', flag: '🇻🇳' },
        { code: 'th', label: 'Thailand', flag: '🇹🇭' },
        { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
        { code: 'ms', label: 'Malaysia', flag: '🇲🇾' },
    ];

    const [countryCode, setCountryCode] = useState("en");

    return (
        <div className={styles.container}>
            {/* Background Orbs */}
            <div className={`${styles.orb} ${styles.orbTop}`} />
            <div className={`${styles.orb} ${styles.orbBottom}`} />

            <div className={styles.formCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('common.signup')}</h1>
                    <p className={styles.subTitle}>Experience Korea like a local</p>
                </div>

                <form onSubmit={handleSignup}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Country</label>
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className={styles.select}
                            required
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? "Creating Account..." : t('common.signup')}
                    </button>
                </form>

                <div className={styles.footer} style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                    Already have an account?{" "}
                    <span
                        onClick={() => router.push('/auth/login')}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Log in
                    </span>
                </div>
            </div>
        </div>
    );
}
