'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initClientLanguage } from '@/lib/i18n/client';
import LanguagePicker from './components/LanguagePicker';
import CurrencySelector from './components/CurrencySelector';
import WeatherWidget from './components/WeatherWidget';
import styles from './home.module.css';

import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [input, setInput] = useState('');
  const [days, setDays] = useState(3);
  const [activeValueIdx, setActiveValueIdx] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);

  const VALUE_PROPS = [
    { icon: '🗓️', key: 'itinerary' },
    { icon: '🎫', key: 'booking' },
    { icon: '🗺️', key: 'navigation' },
  ];

  const PRESETS = [
    { icon: '💆', label: 'Beauty Tour', query: 'clinic,spa,nail', days: 3 },
    { icon: '🍜', label: 'Foodie', query: 'restaurant,cafe', days: 2 },
    { icon: '🏯', label: 'Heritage', query: 'palace,bukchon', days: 2 },
    { icon: '🎶', label: 'K-pop', query: 'hybe,hongdae', days: 1 },
  ];

  useEffect(() => {
    initClientLanguage();

    // Check if user is stored in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserName(parsed.name);
        } catch (e) { }
      }
    }

    const tInterval = setInterval(() => setActiveValueIdx(i => (i + 1) % VALUE_PROPS.length), 3000);
    return () => clearInterval(tInterval);
  }, [VALUE_PROPS.length]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const isKo = i18n.language?.startsWith('ko');

    if (hour < 12) return isKo ? '좋은 아침입니다' : 'Good morning';
    if (hour < 18) return isKo ? '좋은 오후입니다' : 'Good afternoon';
    return isKo ? '좋은 저녁입니다' : 'Good evening';
  };

  const handleStart = () => {
    if (input.trim()) {
      router.push(`/explore?city=${encodeURIComponent(input)}&days=${days}`);
    } else {
      router.push('/explore');
    }
  };

  const handlePreset = (preset: typeof PRESETS[0]) => {
    router.push(`/explore?q=${encodeURIComponent(preset.query)}&days=${preset.days}`);
  };

  return (
    <main className={styles.main}>
      {/* ── Top Navigation (Image Matched) ── */}
      <div className={styles.topNav}>
        {/* Language Selector */}
        <LanguagePicker compact />

        <div style={{ flexGrow: 1 }} /> {/* Spacer */}

        {/* Weather Based on Location */}
        <WeatherWidget />

        {/* Currency Selector (Real Exchange Rates) */}
        <CurrencySelector />

        {/* Auth */}
        {!userName ? (
          <>
            <button className={styles.navBtn} onClick={() => router.push('/auth/signup')}>
              {t('common.signup')}
            </button>
            <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={() => router.push('/auth/login')}>
              {t('common.login')}
            </button>
          </>
        ) : (
          <button className={styles.navBtn} onClick={() => {
            localStorage.removeItem('user');
            setUserName(null);
          }}>
            {userName}
          </button>
        )}
      </div>

      {/* Ambient Background */}
      <div className={styles.orbPurple} />
      <div className={styles.orbBlue} />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.badge}>{t('home.badge')}</div>
        {userName ? (
          <h1 className={styles.heroTitle} style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 'bold', color: 'var(--primary)', textShadow: '0 0 10px rgba(188, 19, 254, 0.5)' }}>
            {getGreeting()}, {userName}님! 👋
          </h1>
        ) : (
          <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: t('home.title').replace(',', ',<br />') }} />
        )}
        <p className={styles.heroSub}>{t('home.subtitle')}</p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>{t('home.how_it_works.title')}</h2>
        <div className={styles.stepsGrid}>
          {[1, 2, 3].map((step) => (
            <div key={step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{step}</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{t(`home.how_it_works.step${step}`)}</div>
                <div className={styles.stepDesc}>{t(`home.how_it_works.step${step}_desc`)}</div>
              </div>
              {step === 3 && <span className={styles.confirmedBadge}>{t('common.confirmed')}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE PROPS CAROUSEL ── */}
      <section className={styles.valueSection}>
        {VALUE_PROPS.map((v, i) => (
          <div
            key={i}
            className={`${styles.valuePill} ${i === activeValueIdx ? styles.valuePillActive : ''}`}
            onClick={() => setActiveValueIdx(i)}
          >
            <span className={styles.valueIcon}>{v.icon}</span>
            <div>
              <div className={styles.valueTitle}>{t(`home.value_props.${v.key}.title`)}</div>
              <div className={styles.valueDesc}>{t(`home.value_props.${v.key}.desc`)}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── SINGLE INPUT ── */}
      <section className={styles.inputSection}>
        <div className={styles.inputLabel}>{t('home.input_label')}</div>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>📍</span>
          <input
            className={styles.inputField}
            placeholder={t('home.input_placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
          {input && (
            <button className={styles.inputClear} onClick={() => setInput('')}>✕</button>
          )}
        </div>

        {/* 기간 선택 */}
        <div className={styles.daysRow}>
          <span className={styles.daysLabel}>{t('home.days_label')}</span>
          <div className={styles.daysChips}>
            {[1, 2, 3, 4, 5, 7].map(d => (
              <button
                key={d}
                className={`${styles.dayChip} ${days === d ? styles.dayChipActive : ''}`}
                onClick={() => setDays(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className={styles.ctaBtn} onClick={handleStart}>
          <span>{t('home.create_trip_cta')}</span>
          <span className={styles.ctaArrow}>→</span>
        </button>
      </section>

      {/* ── PRESETS ── */}
      <section className={styles.presetSection}>
        <div className={styles.presetGrid}>
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              className={styles.presetCard}
              onClick={() => handlePreset(preset)}
            >
              <span className={styles.presetIcon}>{preset.icon}</span>
              <span className={styles.presetLabel}>{t(`home.presets.${preset.label.toLowerCase().replace(' ', '_').replace('-', '_')}`, { defaultValue: preset.label })}</span>
              <span className={styles.presetDays}>{preset.days}{t('common.day_unit', { defaultValue: 'd' })}</span>
            </button>
          ))}
        </div>
      </section>

      {/* bottom spacer */}
      <div style={{ height: 100 }} />
    </main>
  );
}
