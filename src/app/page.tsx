'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import CurrencySelector from './components/CurrencySelector';
import LanguagePicker from './components/LanguagePicker';
import WeatherWidget from './components/WeatherWidget';
import styles from './home.module.css';
import { useTranslation } from 'react-i18next';

type BeautyCategoryId = 'hair' | 'nail' | 'esthetic' | 'waxing' | 'makeup' | 'lash';

type BeautyCategoryOption = {
  id: BeautyCategoryId;
  code: string;
  label: string;
  english: string;
  note: string;
  summary: string;
};

const BEAUTY_CATEGORY_OPTIONS: BeautyCategoryOption[] = [
  {
    id: 'hair',
    code: 'HAIR',
    label: '헤어',
    english: 'Hair',
    note: '커트, 펌, 염색, 드라이',
    summary: '스타일 체인지부터 가벼운 손질까지 가장 빠르게 예약을 시작할 수 있어요.',
  },
  {
    id: 'nail',
    code: 'NAIL',
    label: '네일',
    english: 'Nail',
    note: '젤네일, 케어, 연장',
    summary: '원하는 무드와 디자인을 정하고 가볍게 예약 단계로 넘어갈 수 있어요.',
  },
  {
    id: 'esthetic',
    code: 'CARE',
    label: '에스테틱',
    english: 'Esthetic',
    note: '피부관리, 윤곽, 진정 케어',
    summary: '피부 상태와 원하는 관리 목적에 맞춰 매장을 비교하고 예약할 수 있어요.',
  },
  {
    id: 'waxing',
    code: 'WAX',
    label: '왁싱',
    english: 'Waxing',
    note: '페이스, 바디, 브라질리언',
    summary: '부위와 일정에 맞는 매장을 빠르게 찾고 예약 흐름으로 이어집니다.',
  },
  {
    id: 'makeup',
    code: 'MAKE',
    label: '메이크업',
    english: 'Makeup',
    note: '데일리, 촬영, 웨딩',
    summary: '행사 일정에 맞는 메이크업 서비스를 선택하고 바로 예약을 시작할 수 있어요.',
  },
  {
    id: 'lash',
    code: 'LASH',
    label: '속눈썹',
    english: 'Lash',
    note: '연장, 펌, 언더래쉬',
    summary: '자연스러운 연장부터 볼륨 스타일링까지 원하는 메뉴로 바로 연결됩니다.',
  },
];

const ASSURANCE_ITEMS = [
  {
    title: '한눈에 카테고리 선택',
    description: '첫 화면에서 원하는 서비스를 먼저 고르고 예약 흐름으로 바로 진입합니다.',
  },
  {
    title: '언어 걱정 없는 예약',
    description: '필요할 때 실시간 통역 도우미로 매장과 자연스럽게 대화할 수 있습니다.',
  },
  {
    title: '모바일 우선 예약 동선',
    description: '한 손으로도 선택하기 쉬운 카드형 버튼과 큰 CTA로 전환을 높였습니다.',
  },
];

export default function HomePage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const hasSupabaseAuth = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const [userName, setUserName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BeautyCategoryId | null>(null);

  useEffect(() => {
    if (!hasSupabaseAuth) {
      setUserName(null);
      return;
    }

    let isMounted = true;
    let unsubscribe = () => {};

    const syncSession = async () => {
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!isMounted) return;

          if (session?.user) {
            const user = session.user;
            const name =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'User';
            setUserName(name);
            return;
          }

          setUserName(null);
        });

        unsubscribe = () => subscription.unsubscribe();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          const user = session.user;
          setUserName(
            user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'User',
          );
          return;
        }

        setUserName(null);
      } catch {
        if (isMounted) {
          setUserName(null);
        }
      }
    };

    void syncSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [hasSupabaseAuth]);

  const handleSignOut = async () => {
    if (!hasSupabaseAuth) return;

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.auth.signOut();
    } finally {
      setUserName(null);
    }
  };

  const handleStartBooking = () => {
    if (!selectedCategory) {
      return;
    }

    router.push(`/explore?category=beauty&beautyCategory=${selectedCategory}`);
  };

  const handleOpenInterpreter = () => {
    router.push('/interpreter');
  };

  const selectedOption =
    BEAUTY_CATEGORY_OPTIONS.find((option) => option.id === selectedCategory) ?? null;

  return (
    <main className={styles.main}>
      <div className={styles.topNav}>
        <div className={styles.navTools}>
          <WeatherWidget />
          <LanguagePicker compact />
          <CurrencySelector />
        </div>
        {!hasSupabaseAuth ? null : !userName ? (
          <div className={styles.navAuthWrap}>
            <button className={styles.navLinkBtn} type="button" onClick={() => router.push('/auth/login')}>
              <span className={styles.authIcon}>👤</span>
            </button>
          </div>
        ) : (
          <button className={styles.navLinkBtn} type="button" onClick={() => void handleSignOut()}>
            <span className={styles.authIcon}>👋</span>
          </button>
        )}
      </div>

      <div className={styles.backgroundEffects}>
        <div className={styles.orbRose} />
        <div className={styles.orbSand} />
      </div>

      <section className={styles.heroSection}>
        <Image src="/kello-logo.png" alt="Kello" width={124} height={28} className={styles.heroLogo} priority />
        <div className={styles.heroEyebrow}>{t('home_beauty.hero.eyebrow')}</div>
        <h1 className={styles.heroTitle}>{t('home_beauty.hero.title')}</h1>
        <p className={styles.heroSubtitle}>
          {t('home_beauty.hero.subtitle')}
        </p>
        {userName ? (
          <p className={styles.welcomeText}>
            {t('home_beauty.hero.welcome', { name: userName })}
          </p>
        ) : null}
      </section>

      <section className={styles.bookingShell}>
        <div className={styles.bookingCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>{t('home_beauty.booking.step')}</span>
            <h2 className={styles.sectionTitle}>{t('home_beauty.booking.title')}</h2>
            <p className={styles.sectionDescription}>
              {t('home_beauty.booking.description')}
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {BEAUTY_CATEGORY_OPTIONS.map((option) => {
              const isActive = selectedCategory === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ''}`}
                  onClick={() => setSelectedCategory(option.id)}
                >
                  <span className={styles.categoryCode}>{option.code}</span>
                  <span className={styles.categoryLabel}>{t(`home_beauty.categories.${option.id}.label`)}</span>
                  <span className={styles.categoryEnglish}>{option.english}</span>
                  <span className={styles.categoryNote}>{t(`home_beauty.categories.${option.id}.note`)}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.selectionPanel}>
            <span className={styles.selectionEyebrow}>{t('home_beauty.selection.eyebrow')}</span>
            {selectedOption ? (
              <div className={styles.selectionRow}>
                <div>
                  <h3 className={styles.selectionTitle}>{t(`home_beauty.categories.${selectedOption.id}.label`)}</h3>
                  <p className={styles.selectionDescription}>{t(`home_beauty.categories.${selectedOption.id}.summary`)}</p>
                </div>
                <div className={styles.selectionTagRow}>
                  <span className={styles.selectionTag}>{t('home_beauty.selection.tags.mobile')}</span>
                  <span className={styles.selectionTag}>{t('home_beauty.selection.tags.comparison')}</span>
                  <span className={styles.selectionTag}>{t('home_beauty.selection.tags.inquiry')}</span>
                </div>
              </div>
            ) : (
              <div className={styles.selectionEmpty}>
                {t('home_beauty.selection.empty')}
              </div>
            )}
          </div>

          <div className={styles.ctaSection}>
            <p className={styles.ctaHint}>
              {t('home_beauty.cta.hint')}
            </p>
            <button
              className={styles.mainCtaBtn}
              type="button"
              disabled={!selectedCategory}
              onClick={handleStartBooking}
            >
              {t('home_beauty.cta.button')}
              <span className={styles.arrowIcon}>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.supportSection}>
        <article className={styles.interpreterCard}>
          <span className={styles.interpreterEyebrow}>{t('home_beauty.interpreter.eyebrow')}</span>
          <h2 className={styles.interpreterTitle}>{t('home_beauty.interpreter.title')}</h2>
          <p className={styles.interpreterDescription}>
            {t('home_beauty.interpreter.description')}
          </p>
          <button className={styles.secondaryBtn} type="button" onClick={handleOpenInterpreter}>
            {t('home_beauty.interpreter.button')}
          </button>
        </article>

        <div className={styles.assuranceGrid}>
          {ASSURANCE_ITEMS.map((item, index) => (
            <article key={item.title} className={styles.assuranceCard}>
              <h3 className={styles.assuranceTitle}>{t(`home_beauty.assurance.items.${index}.title`)}</h3>
              <p className={styles.assuranceDescription}>{t(`home_beauty.assurance.items.${index}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.bottomSpacer} />
    </main>
  );
}
