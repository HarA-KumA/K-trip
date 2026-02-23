'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { initClientLanguage } from '@/lib/i18n/client';
import styles from './today.module.css';

// Mock today's schedule — 실제로는 planner state/DB에서 읽어옴
const TODAY_SCHEDULE = [
    {
        id: 1,
        time: '10:00',
        endTime: '12:00',
        title: '아모레스토어 성수 스파 예약',
        location: '성수동 2가 273-12',
        type: 'beauty',
        status: 'confirmed',   // confirmed | pending | done
        bookingRef: 'KT-2847',
        lat: 37.5445,
        lng: 127.0557,
    },
    {
        id: 2,
        time: '13:00',
        endTime: '14:30',
        title: '광장시장 먹거리 탐방',
        location: '종로구 창경궁로 88',
        type: 'food',
        status: 'confirmed',
        bookingRef: null,
        lat: 37.5700,
        lng: 126.9994,
    },
    {
        id: 3,
        time: '15:00',
        endTime: '17:00',
        title: '경복궁 관람',
        location: '세종로 1-91',
        type: 'attraction',
        status: 'confirmed',
        bookingRef: 'KT-2901',
        lat: 37.5796,
        lng: 126.9770,
    },
    {
        id: 4,
        time: '19:00',
        endTime: '21:00',
        title: '전통 한정식 저녁',
        location: '종로구 북촌로 84',
        type: 'food',
        status: 'confirmed',
        bookingRef: 'KT-2915',
        lat: 37.5831,
        lng: 126.9849,
    },
];

const TYPE_META: Record<string, { icon: string; color: string }> = {
    beauty: { icon: '💆', color: '#a78bfa' },
    food: { icon: '🍽️', color: '#fb923c' },
    attraction: { icon: '🏯', color: '#34d399' },
    move: { icon: '🚇', color: '#60a5fa' },
    default: { icon: '📍', color: '#94a3b8' },
};

function getMinutes(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

export default function TodayPage() {
    const router = useRouter();
    const [now, setNow] = useState(new Date());
    const [checkedIds, setCheckedIds] = useState<number[]>([]);

    useEffect(() => {
        initClientLanguage();
        const t = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Classify events
    const pastEvents = TODAY_SCHEDULE.filter(e => getMinutes(e.endTime) <= nowMinutes);
    const activeEvent = TODAY_SCHEDULE.find(
        e => getMinutes(e.time) <= nowMinutes && getMinutes(e.endTime) > nowMinutes
    );
    const upcomingEvents = TODAY_SCHEDULE.filter(e => getMinutes(e.time) > nowMinutes);
    const nextEvent = upcomingEvents[0];

    // Countdown to next event
    const minutesToNext = nextEvent ? getMinutes(nextEvent.time) - nowMinutes : null;

    const handleNavigate = useCallback((lat: number, lng: number, title: string) => {
        // Deep-link to maps
        window.open(`https://map.kakao.com/link/to/${encodeURIComponent(title)},${lat},${lng}`, '_blank');
    }, []);

    const toggleCheck = useCallback((id: number) => {
        setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, []);

    // Guard: no schedule
    if (TODAY_SCHEDULE.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <h2 className={styles.emptyTitle}>오늘 일정이 없어요</h2>
                <p className={styles.emptyDesc}>Explore에서 장소를 담고 일정을 만들어보세요</p>
                <button className={styles.emptyBtn} onClick={() => router.push('/explore')}>
                    일정 만들러 가기 →
                </button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* ── Header ── */}
            <header className={styles.header}>
                <div className={styles.headerDate}>
                    {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </div>
                <h1 className={styles.headerTitle}>오늘 일정</h1>
                <div className={styles.headerTime}>
                    {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
            </header>

            {/* ── Active Now Card ── */}
            {activeEvent && (
                <section className={styles.activeCard}>
                    <div className={styles.activeNowBadge}>● 지금 진행 중</div>
                    <div className={styles.activeMain}>
                        <span className={styles.activeIcon}>
                            {(TYPE_META[activeEvent.type] ?? TYPE_META.default).icon}
                        </span>
                        <div>
                            <div className={styles.activeTitle}>{activeEvent.title}</div>
                            <div className={styles.activeLoc}>📍 {activeEvent.location}</div>
                        </div>
                    </div>
                    <div className={styles.activeActions}>
                        <button
                            className={styles.navBtn}
                            onClick={() => handleNavigate(activeEvent.lat, activeEvent.lng, activeEvent.title)}
                        >
                            🗺️ 길찾기
                        </button>
                        {activeEvent.bookingRef && (
                            <div className={styles.refBadge}>예약번호 {activeEvent.bookingRef}</div>
                        )}
                    </div>
                </section>
            )}

            {/* ── Next Event Countdown ── */}
            {nextEvent && minutesToNext !== null && (
                <section className={styles.countdownCard}>
                    <div className={styles.countdownLabel}>다음 일정까지</div>
                    <div className={styles.countdownTime}>
                        {minutesToNext >= 60
                            ? `${Math.floor(minutesToNext / 60)}시간 ${minutesToNext % 60}분`
                            : `${minutesToNext}분`}
                    </div>
                    <div className={styles.countdownEvent}>
                        {nextEvent.time} · {nextEvent.title}
                    </div>
                    <button
                        className={styles.miniNavBtn}
                        onClick={() => handleNavigate(nextEvent.lat, nextEvent.lng, nextEvent.title)}
                    >
                        미리 출발하기 →
                    </button>
                </section>
            )}

            {/* ── Today Timeline ── */}
            <section className={styles.timeline}>
                <div className={styles.timelineTitle}>전체 일정</div>
                {TODAY_SCHEDULE.map((event, idx) => {
                    const isPast = getMinutes(event.endTime) <= nowMinutes;
                    const isActive = activeEvent?.id === event.id;
                    const isChecked = checkedIds.includes(event.id);
                    const meta = TYPE_META[event.type] ?? TYPE_META.default;

                    return (
                        <div key={event.id} className={`${styles.timelineItem} ${isActive ? styles.timelineActive : ''} ${isPast ? styles.timelinePast : ''}`}>
                            {/* Time Column */}
                            <div className={styles.timeCol}>
                                <div className={styles.timeText}>{event.time}</div>
                                {idx < TODAY_SCHEDULE.length - 1 && <div className={styles.timeConnector} />}
                            </div>

                            {/* Dot */}
                            <div className={styles.dot} style={{ background: isActive ? meta.color : isPast ? '#374151' : meta.color + '80' }}>
                                {isActive && <div className={styles.dotPulse} />}
                            </div>

                            {/* Content Card */}
                            <div className={styles.eventCard}>
                                <div className={styles.eventHeader}>
                                    <span className={styles.eventIcon}>{meta.icon}</span>
                                    <div className={styles.eventInfo}>
                                        <div className={styles.eventTitle}>{event.title}</div>
                                        <div className={styles.eventTime}>{event.time} – {event.endTime} · {event.location.split(' ').slice(0, 2).join(' ')}</div>
                                    </div>
                                    {/* Check off */}
                                    <button
                                        className={`${styles.checkBtn} ${isChecked ? styles.checkBtnDone : ''}`}
                                        onClick={() => toggleCheck(event.id)}
                                    >
                                        {isChecked ? '✓' : '○'}
                                    </button>
                                </div>

                                {/* Booking ref */}
                                {event.bookingRef && (
                                    <div className={styles.eventRef}>예약번호 {event.bookingRef}</div>
                                )}

                                {/* Actions: only upcoming */}
                                {!isPast && (
                                    <div className={styles.eventActions}>
                                        <button
                                            className={styles.eventNavBtn}
                                            onClick={() => handleNavigate(event.lat, event.lng, event.title)}
                                        >
                                            🗺️ 길찾기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* ── No-show Alert Banner ── */}
            {nextEvent && minutesToNext !== null && minutesToNext <= 30 && minutesToNext > 0 && (
                <div className={styles.alertBanner}>
                    ⚠️ <strong>{nextEvent.title}</strong> 예약 {minutesToNext}분 후 — 지금 출발하세요!
                </div>
            )}

            <div style={{ height: 100 }} />
        </div>
    );
}
