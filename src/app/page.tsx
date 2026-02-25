'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import LanguagePicker from './components/LanguagePicker';
import CurrencySelector from './components/CurrencySelector';
import WeatherWidget from './components/WeatherWidget';
import styles from './home.module.css';

import { useTranslation } from 'react-i18next';
import { useTrip } from '@/lib/contexts/TripContext';
import { MOCK_ITEMS } from './explore/mock/data';

export default function HomePage() {
  const { t, i18n } = useTranslation('common');
  const { tripStatus, itinerary } = useTrip();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [days, setDays] = useState(3);
  const [activeValueIdx, setActiveValueIdx] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);

  // Navigation Sheet States
  const [openNavSheet, setOpenNavSheet] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);

  // Navigation Search States
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState<any>(null);

  // Get next destination for navigation
  const nextDest = itinerary.find(item => item.status === 'confirmed');

  // The effective destination for the sheet
  const destInfo = useMemo(() => {
    if (selectedDest) {
      return {
        name: selectedDest.title,
        nameKo: selectedDest.area || selectedDest.title,
        lat: selectedDest.lat || 37.5665,
        lng: selectedDest.lng || 126.9780,
        travelMinutes: 20
      };
    }
    if (nextDest) {
      return {
        name: nextDest.name,
        nameKo: (nextDest as any).location || nextDest.name,
        lat: nextDest.lat,
        lng: nextDest.lng,
        travelMinutes: 20
      };
    }
    return {
      name: 'Gyeongbokgung Palace',
      nameKo: '서울특별시 종로구 사직로 161',
      lat: 37.5796,
      lng: 126.9770,
      travelMinutes: 15
    };
  }, [selectedDest, nextDest]);

  const navSearchResults = useMemo(() => {
    if (!navSearchQuery.trim()) return [];
    return MOCK_ITEMS.filter(item =>
      item.title.toLowerCase().includes(navSearchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(navSearchQuery.toLowerCase())
    ).slice(0, 5);
  }, [navSearchQuery]);

  const VALUE_PROPS = [
    {
      icon: '🗺️',
      key: 'navigation',
      path: '/navigation',
      label: tripStatus !== 'idle' ? t(`fab.${tripStatus.replace('-', '_')}`, { defaultValue: t('home.value_props.navigation.title') }) : t('home.value_props.navigation.title')
    },
    { icon: '🎫', key: 'booking', path: '/explore', label: t('home.value_props.booking.title') },
    { icon: '🗓️', key: 'itinerary', path: '/planner', label: t('home.value_props.itinerary.title') },
  ];

  const FEATURED_PLANS = [
    { icon: '🍜', label: 'Foodie', query: 'restaurant,cafe', days: 2 },
    { icon: '🏯', label: 'Heritage', query: 'palace,bukchon', days: 2 },
    { icon: '🎶', label: 'K-pop', query: 'hybe,hongdae', days: 1 },
    { icon: '🛍️', label: 'Shopping', query: 'myeongdong,seongsu', days: 1 },
  ];

  useEffect(() => {
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

  const handleKRide = () => {
    if (!destInfo) return;
    const address = destInfo.nameKo || destInfo.name;
    navigator.clipboard.writeText(address).catch(() => { });
    const deeplink = `kride://route?dest_lat=${destInfo.lat}&dest_lng=${destInfo.lng}&dest_name=${encodeURIComponent(address)}`;
    window.location.href = deeplink;
    setTimeout(() => {
      if (document.hidden) return;
      const ua = navigator.userAgent;
      const isiOS = ua.includes('iPhone') || ua.includes('iPad');
      window.open(isiOS ? 'https://apps.apple.com/kr/app/kakao-t/id981110422' : 'https://play.google.com/store/apps/details?id=com.kakao.taxi', '_blank');
    }, 2500);
    setOpenNavSheet(false);
  };

  const handleTransit = () => {
    if (!destInfo) return;
    const address = destInfo.nameKo || destInfo.name;
    const lat = destInfo.lat;
    const lng = destInfo.lng;

    // Use browser geolocation to get current position for better app deep linking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const sLat = pos.coords.latitude;
        const sLng = pos.coords.longitude;
        // KakaoMap: sp = start point, ep = end point
        const appUrl = `kakaomap://route?sp=${sLat},${sLng}&ep=${lat},${lng}&by=PUBLICTRANSIT`;
        const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(address)},${lat},${lng}`;

        window.location.href = appUrl;
        setTimeout(() => {
          if (document.hidden) return;
          window.open(webUrl, '_blank');
        }, 2500);
      }, () => {
        // Fallback if location permission denied
        const appUrl = `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`;
        const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(address)},${lat},${lng}`;
        window.location.href = appUrl;
        setTimeout(() => {
          if (document.hidden) return;
          window.open(webUrl, '_blank');
        }, 2500);
      });
    }

    setOpenNavSheet(false);
  };

  const handleCopy = useCallback(async () => {
    if (!destInfo) return;
    await navigator.clipboard.writeText(destInfo.nameKo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [destInfo]);

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

  const handlePreset = (preset: any) => {
    router.push(`/explore?q=${encodeURIComponent(preset.query)}&days=${preset.days}`);
  };

  return (
    <main className={styles.main}>
      <div className={styles.topNav}>
        <LanguagePicker compact />
        <div style={{ flexGrow: 1 }} />
        <WeatherWidget />
        <CurrencySelector />
        {!userName ? (
          <>
            <button className={styles.navBtn} onClick={() => router.push('/auth/signup')}>{t('common.signup')}</button>
            <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={() => router.push('/auth/login')}>{t('common.login')}</button>
          </>
        ) : (
          <button className={styles.navBtn} onClick={() => { localStorage.removeItem('user'); setUserName(null); }}>{userName}</button>
        )}
      </div>

      <div className={styles.orbPurple} />
      <div className={styles.orbBlue} />

      <section className={styles.hero}>
        <div className={styles.badge}>{t('home.badge')}</div>
        {userName ? (
          <h1 className={styles.heroTitle} style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 'bold' }}>{getGreeting()}, {userName}님! 👋</h1>
        ) : (
          <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: t('home.title').replace(',', ',<br />') }} />
        )}
        <p className={styles.heroSub}>{t('home.subtitle')}</p>
      </section>

      <section className={styles.valueSection}>
        {VALUE_PROPS.map((v, i) => (
          <div key={i} className={`${styles.valuePill} ${i === activeValueIdx ? styles.valuePillActive : ''}`} onClick={() => { setActiveValueIdx(i); if (v.key === 'navigation') setOpenNavSheet(true); else router.push(v.path); }}>
            <span className={styles.valueIcon}>{v.icon}</span>
            <div>
              <div className={styles.valueTitle}>{v.label}</div>
              <div className={styles.valueDesc}>{t(`home.value_props.${v.key}.desc`)}</div>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.featuredSection}>
        <div className={styles.featuredGrid}>
          {FEATURED_PLANS.map(preset => (
            <button key={preset.label} className={styles.featuredCard} onClick={() => handlePreset(preset)}>
              <span className={styles.featuredIcon}>{preset.icon}</span>
              <span className={styles.featuredLabel}>{t(`home.presets.${preset.label.toLowerCase().replace(' ', '_')}`, { defaultValue: preset.label })}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.inputSection}>
        <div className={styles.inputLabel}>{t('home.input_label')}</div>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>📍</span>
          <input className={styles.inputField} placeholder={t('home.input_placeholder')} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStart()} />
          {input && <button className={styles.inputClear} onClick={() => setInput('')}>✕</button>}
        </div>
        <div className={styles.daysRow}>
          <span className={styles.daysLabel}>{t('home.days_label')}</span>
          <div className={styles.daysChips}>
            {[1, 2, 3, 4, 5, 7].map(d => (
              <button key={d} className={`${styles.dayChip} ${days === d ? styles.dayChipActive : ''}`} onClick={() => setDays(d)}>{d}</button>
            ))}
          </div>
        </div>
        <button className={styles.ctaBtn} onClick={handleStart}><span>{t('home.create_trip_cta')}</span><span className={styles.ctaArrow}>→</span></button>
      </section>

      {openNavSheet && (
        <div className={styles.overlay} onClick={() => setOpenNavSheet(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <div className={styles.navSearchBox}>
              <div className={styles.inputWrap} style={{ marginBottom: '8px' }}>
                <span className={styles.inputIcon}>🔍</span>
                <input className={styles.inputField} placeholder={t('explore_page.search_placeholders.all')} value={navSearchQuery} onChange={e => setNavSearchQuery(e.target.value)} />
                {navSearchQuery && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className={styles.searchMapBtn}
                      onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(navSearchQuery)}`, '_blank')}
                      title="Search on Google Maps"
                    >
                      🌐
                    </button>
                    <button className={styles.inputClear} onClick={() => setNavSearchQuery('')}>✕</button>
                  </div>
                )}
              </div>
              {navSearchResults.length > 0 && (
                <div className={styles.searchResultsDropdown}>
                  {navSearchResults.map(item => (
                    <div key={item.id} className={styles.searchResultItem} onClick={() => { setSelectedDest(item); setNavSearchQuery(''); }}>
                      <span style={{ marginRight: '8px' }}>📍</span>
                      <div>
                        <div className={styles.searchResultTitle}>{item.title}</div>
                        <div className={styles.searchResultArea}>{item.area}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className={`${styles.option} ${styles.optionKride}`} onClick={handleKRide}>
              <span className={styles.optionIcon}>🚕</span>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{t('fab.kride')}</span>
                <span className={styles.optionSub}>{t('fab.kride_sub', { mins: destInfo.travelMinutes })}</span>
              </div>
              <span className={styles.optionArrow}>→</span>
            </button>

            <button className={styles.option} onClick={handleTransit}>
              <span className={styles.optionIcon}>🚇</span>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{t('fab.transit')}</span>
                <span className={styles.optionSub}>{t('fab.transit_sub')}</span>
              </div>
              <span className={styles.optionArrow}>→</span>
            </button>

            <button className={styles.option} onClick={handleCopy}>
              <span className={styles.optionIcon}>📋</span>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{t('fab.copy')}</span>
                <span className={styles.optionSub}>{copied ? t('fab.copy_done') : t('fab.copy')}</span>
              </div>
            </button>

            <button className={styles.option} onClick={() => { setOpenNavSheet(false); setShowCard(true); }}>
              <span className={styles.optionIcon}>🗺️</span>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{t('fab.card')}</span>
                <span className={styles.optionSub}>{t('fab.card_sub')}</span>
              </div>
              <span className={styles.optionArrow}>→</span>
            </button>

            <button className={styles.cancelBtn} onClick={() => setOpenNavSheet(false)}>{t('fab.cancel')}</button>
          </div>
        </div>
      )}

      {showCard && (
        <div className={styles.overlay} onClick={() => setShowCard(false)}>
          <div className={styles.addressCard} onClick={e => e.stopPropagation()}>
            <div className={styles.cardTitle}>{t('fab.card_modal_title')}</div>
            <div className={styles.cardAddress}>{destInfo.nameKo}</div>
            <div className={styles.cardName}>{destInfo.name}</div>
            <button className={styles.cardCopyBtn} onClick={handleCopy}>{copied ? t('fab.copy_done') : t('fab.copy')}</button>
            <button className={styles.cardCloseBtn} onClick={() => setShowCard(false)}>{t('fab.cancel')}</button>
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />
    </main>
  );
}
