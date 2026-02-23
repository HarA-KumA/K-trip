'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initClientLanguage } from '@/lib/i18n/client';
import styles from './home.module.css';

const VALUE_PROPS = [
  { icon: '📅', title: '일정 자동 정리', desc: '숙소·관광·식사를 AI가 최적 순서로' },
  { icon: '🎫', title: '예약 대행', desc: '클리닉·스파·레스토랑 한번에 예약' },
  { icon: '🗺️', title: '실시간 이동 안내', desc: '지하철·도보 경로를 한국어 없이도' },
];

const PRESETS = [
  { icon: '💆', label: '뷰티 투어', query: '피부과,스파,네일', days: 3 },
  { icon: '🍜', label: '미식 여행', query: '맛집,카페,야시장', days: 2 },
  { icon: '🏯', label: '문화 탐방', query: '경복궁,북촌,인사동', days: 2 },
  { icon: '🎶', label: 'K-pop 성지', query: 'HYBE,SM,홍대', days: 1 },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [days, setDays] = useState(3);
  const [activeValueIdx, setActiveValueIdx] = useState(0);

  useEffect(() => {
    initClientLanguage();
    // Auto-rotate value props
    const t = setInterval(() => setActiveValueIdx(i => (i + 1) % VALUE_PROPS.length), 3000);
    return () => clearInterval(t);
  }, []);

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
      {/* Ambient Background */}
      <div className={styles.orbPurple} />
      <div className={styles.orbBlue} />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.badge}>✦ Korea Travel OS</div>
        <h1 className={styles.heroTitle}>
          한국 여행,<br />
          <span className={styles.heroAccent}>3초만에 이해</span>
        </h1>
        <p className={styles.heroSub}>예약 대행 · 일정 자동 정리 · 이동 안내</p>
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
              <div className={styles.valueTitle}>{v.title}</div>
              <div className={styles.valueDesc}>{v.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── SINGLE INPUT ── */}
      <section className={styles.inputSection}>
        <div className={styles.inputLabel}>어디로 여행하시나요?</div>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>📍</span>
          <input
            className={styles.inputField}
            placeholder="도시 · 지역 · 숙소 이름"
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
          <span className={styles.daysLabel}>여행 기간</span>
          <div className={styles.daysChips}>
            {[1, 2, 3, 4, 5, 7].map(d => (
              <button
                key={d}
                className={`${styles.dayChip} ${days === d ? styles.dayChipActive : ''}`}
                onClick={() => setDays(d)}
              >
                {d}일
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className={styles.ctaBtn} onClick={handleStart}>
          <span>일정 만들기 시작</span>
          <span className={styles.ctaArrow}>→</span>
        </button>
      </section>

      {/* ── PRESETS ── */}
      <section className={styles.presetSection}>
        <div className={styles.sectionLabel}>추천 코스 바로 시작</div>
        <div className={styles.presetGrid}>
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              className={styles.presetCard}
              onClick={() => handlePreset(preset)}
            >
              <span className={styles.presetIcon}>{preset.icon}</span>
              <span className={styles.presetLabel}>{preset.label}</span>
              <span className={styles.presetDays}>{preset.days}일</span>
            </button>
          ))}
        </div>
      </section>

      {/* bottom spacer */}
      <div style={{ height: 100 }} />
    </main>
  );
}
