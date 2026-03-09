'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguagePicker from './components/LanguagePicker';
import CurrencySelector from './components/CurrencySelector';
import styles from './home.module.css';
import { supabase } from '@/lib/supabaseClient';
import { useTrip } from '@/lib/contexts/TripContext';
import TravelPlanTemplates from './components/TravelPlanTemplates';

export default function HomePage() {
  const { t } = useTranslation('common');
  const { setTripDays, setItinerary } = useTrip();
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);

  // Search Input State
  const [where, setWhere] = useState('');
  const [who, setWho] = useState('solo');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    // Keep in sync with Supabase session in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';
        setUserName(name);
      } else {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => {
    setTripDays(days);
    setItinerary([]);
    if (where.trim()) {
      router.push(`/explore?city=${encodeURIComponent(where.trim())}&days=${days}`);
    } else {
      router.push('/planner');
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Safe translation helper
  const homeTrans = (key: string, defaultValue?: string): any => {
    const defaultVal = defaultValue || key;
    return t(`home_new.${key}`, { defaultValue: defaultVal, returnObjects: true });
  };

  const whoOptions = homeTrans('input.who_options') as Record<string, string>;
  const interestsOptions = homeTrans('input.interests_options') as Record<string, string>;
  const trustItems = homeTrans('trust.items') as string[] | undefined;

  return (
    <main className={styles.main}>
      <div className={styles.topNav}>
        <div className={styles.navTools}>
          <LanguagePicker compact />
          <CurrencySelector />
        </div>
        {!userName ? (
          <div className={styles.navAuthWrap}>
            <button className={styles.navLinkBtn} onClick={() => router.push('/auth/login')}>
              <span className={styles.authIcon}>👤</span>
            </button>
          </div>
        ) : (
          <button className={styles.navLinkBtn} onClick={async () => { await supabase.auth.signOut(); setUserName(null); }}>
            <span className={styles.authIcon}>👋</span>
          </button>
        )}
      </div>

      <div className={styles.backgroundEffects}>
        <div className={styles.orbPurple} />
        <div className={styles.orbBlue} />
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <img src="/kello-logo.png" alt="Kello" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>
          {homeTrans('hero_title', '한국 여행, 일정부터 예약까지 한 번에')}
        </h1>
        <p className={styles.heroSubtitle}>
          {homeTrans('hero_subtitle', '여행 일정 추천부터 예약 지원까지 빠르게 시작하세요.')}
        </p>
        <div className={styles.featuresGrid}>
          <div className={styles.featurePill}>🎫 <span>{homeTrans('features.booking', '예약까지 한 번에')}</span></div>
          <div className={styles.featurePill}>🗓️ <span>{homeTrans('features.ai_plan', 'AI로 일정 완성')}</span></div>
          <div className={styles.featurePill}>🗺️ <span>{homeTrans('features.navi', '길찾기 걱정 없이')}</span></div>
        </div>
      </section>

      {/* Travel Input Card */}
      <section className={styles.inputCardWrapper}>
        <div className={styles.inputCard}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>📍 {homeTrans('input.where', '어디로 가나요?')}</label>
            <div className={styles.whereInputWrap}>
              <input
                className={styles.whereInput}
                placeholder={homeTrans('input.where_placeholder', '서울, 부산, 제주...') as string}
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    handleStart();
                  }
                }}
              />
              {where && <button className={styles.clearBtn} onClick={() => setWhere('')}>✕</button>}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>📅 {homeTrans('input.when', '언제 가나요?')}</label>
            <div className={styles.daysValueContainer}>
              <span className={styles.daysNumber}>
                {days}{homeTrans('input.days_suffix', '일')}
              </span>
              <div className={styles.daysControls}>
                <button className={styles.dayBtn} onClick={() => setDays(Math.max(1, days - 1))}>−</button>
                <button className={styles.dayBtn} onClick={() => setDays(Math.min(14, days + 1))}>+</button>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>🤝 {homeTrans('input.who', '누구와 가나요?')}</label>
            <div className={styles.chipGrid}>
              {['solo', 'couple', 'friends', 'family'].map((key) => (
                <button
                  key={key}
                  className={`${styles.selectChip} ${who === key ? styles.selectChipActive : ''}`}
                  onClick={() => setWho(key)}
                >
                  {whoOptions ? whoOptions[key] : key}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>✨ {homeTrans('input.interests', '어떤 여행을 원하시나요?')}</label>
            <div className={styles.chipGrid3}>
              {['food', 'shopping', 'beauty', 'sightseeing', 'night', 'experience'].map((key) => {
                const isActive = interests.includes(key);
                return (
                  <button
                    key={key}
                    className={`${styles.selectChip} ${isActive ? styles.selectChipActive : ''}`}
                    onClick={() => toggleInterest(key)}
                  >
                    {interestsOptions ? interestsOptions[key] : key}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.ctaSection}>
            <div className={styles.ctaHelper}>{homeTrans('cta_helper', '1분 안에 여행 일정 추천 받기')}</div>
            <button className={styles.mainCtaBtn} onClick={handleStart}>
              {homeTrans('cta_btn', '나만의 일정 만들기')} <span className={styles.arrowIcon}>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trust Factors */}
      <section className={styles.trustSection}>
        <div className={styles.trustTitle}>
          {homeTrans('trust.title', 'Kello와 함께하는 안심 여행')}
        </div>
        <div className={styles.trustGrid}>
          {Array.isArray(trustItems) && trustItems.map((item, idx) => (
            <div key={idx} className={styles.trustItem}>
              <span className={styles.trustIcon}>✔</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Plans */}
      <TravelPlanTemplates />

      <div style={{ height: 100 }} />
    </main>
  );
}
