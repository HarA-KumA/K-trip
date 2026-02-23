'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './KRideGlobalFAB.module.css';

// 오늘 일정 모의 — 실제 구현 시 전역 상태(Context/Zustand)로 교체
const MOCK_NEXT_DEST = {
    name: '아모레스토어 성수 스파',
    nameKo: '서울특별시 성동구 성수이로 5',
    lat: 37.5445,
    lng: 127.0557,
    scheduleAt: new Date(Date.now() + 45 * 60 * 1000), // 45분 후
    travelMinutes: 20,
};

// FAB를 숨기는 경로
const HIDE_ROUTES = ['/auth', '/my', '/lang-test'];

type FABState = 'NO_SCHEDULE' | 'PRE_TRAVEL' | 'IMMINENT';

function getFABState(): FABState {
    const dest = MOCK_NEXT_DEST;
    if (!dest) return 'NO_SCHEDULE';
    const minsUntilSchedule = (dest.scheduleAt.getTime() - Date.now()) / 60_000;
    const minsUntilDepart = minsUntilSchedule - dest.travelMinutes - 15;
    if (minsUntilDepart <= 60) return 'IMMINENT';
    return 'PRE_TRAVEL';
}

const FAB_CONFIG: Record<FABState, { label: string; icon: string; color: string }> = {
    NO_SCHEDULE: { label: '이동 수단', icon: '🚕', color: '#6B7280' },
    PRE_TRAVEL: { label: '다음 장소로 이동', icon: '📍', color: '#3B82F6' },
    IMMINENT: { label: 'k.ride 호출', icon: '🚗', color: 'gradient' },
};

export default function KRideGlobalFAB() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [fabState, setFabState] = useState<FABState>('PRE_TRAVEL');
    const [copied, setCopied] = useState(false);
    const [shrink, setShrink] = useState(false);

    useEffect(() => {
        setFabState(getFABState());
    }, []);

    // 스크롤 축소
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const now = window.scrollY;
            setShrink(now > lastY && now > 80);
            lastY = now;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const shouldHide =
        HIDE_ROUTES.some(r => pathname.startsWith(r));

    if (shouldHide) return null;

    const cfg = FAB_CONFIG[fabState];

    // ── 액션 핸들러 ─────────────────────────────────────────────────
    const handleKRide = useCallback(() => {
        const dest = MOCK_NEXT_DEST;
        // 주소 클립보드 자동 복사 (fallback)
        navigator.clipboard.writeText(dest.nameKo).catch(() => { });
        // k.ride 딥링크
        const deeplink = `kride://route?dest_lat=${dest.lat}&dest_lng=${dest.lng}&dest_name=${encodeURIComponent(dest.nameKo)}`;
        window.location.href = deeplink;
        // 500ms 후 미설치 fallback
        setTimeout(() => {
            const ua = navigator.userAgent;
            if (ua.includes('iPhone') || ua.includes('iPad')) {
                window.open('https://apps.apple.com/kr/app/kakao-t/id981110422', '_blank');
            } else {
                window.open('https://play.google.com/store/apps/details?id=com.kakao.taxi', '_blank');
            }
        }, 1200);
        setOpen(false);
    }, []);

    const handleTransit = useCallback(() => {
        const dest = MOCK_NEXT_DEST;
        window.open(
            `kakaomap://route?ep=${dest.lat},${dest.lng}&by=PUBLICTRANSIT`,
            '_blank'
        );
        setTimeout(() => {
            window.open(
                `https://map.kakao.com/link/to/${encodeURIComponent(dest.name)},${dest.lat},${dest.lng}`,
                '_blank'
            );
        }, 500);
        setOpen(false);
    }, []);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(MOCK_NEXT_DEST.nameKo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const handleAddressCard = useCallback(() => {
        setOpen(false);
        setTimeout(() => setShowCard(true), 100);
    }, []);

    const [showCard, setShowCard] = useState(false);

    // FAB 클릭
    const handleFAB = () => {
        if (fabState === 'NO_SCHEDULE') {
            router.push('/planner');
            return;
        }
        setOpen(true);
    };

    return (
        <>
            {/* ── FAB Button ── */}
            <button
                className={`${styles.fab} ${fabState === 'IMMINENT' ? styles.fabImminent : ''} ${shrink ? styles.fabShrink : ''}`}
                onClick={handleFAB}
                aria-label="k.ride 이동 수단"
            >
                <span className={styles.fabIcon}>{cfg.icon}</span>
                {!shrink && <span className={styles.fabLabel}>{cfg.label}</span>}
            </button>

            {/* ── Action Sheet Overlay ── */}
            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.sheetHandle} />

                        {/* Destination Info */}
                        <div className={styles.destBanner}>
                            <span className={styles.destIcon}>📍</span>
                            <div>
                                <div className={styles.destName}>{MOCK_NEXT_DEST.name}</div>
                                <div className={styles.destAddr}>{MOCK_NEXT_DEST.nameKo}</div>
                            </div>
                        </div>

                        {/* Option 1 — k.ride (Primary) */}
                        <button
                            className={`${styles.option} ${styles.optionKride}`}
                            onClick={handleKRide}
                        >
                            <span className={styles.optionIcon}>🚗</span>
                            <div className={styles.optionText}>
                                <span className={styles.optionTitle}>k.ride 앱 열기</span>
                                <span className={styles.optionSub}>예상 이동 {MOCK_NEXT_DEST.travelMinutes}분</span>
                            </div>
                            <span className={styles.optionArrow}>→</span>
                        </button>

                        {/* Option 2 — 대중교통 */}
                        <button className={styles.option} onClick={handleTransit}>
                            <span className={styles.optionIcon}>🚇</span>
                            <div className={styles.optionText}>
                                <span className={styles.optionTitle}>대중교통 / 도보 길찾기</span>
                                <span className={styles.optionSub}>카카오맵으로 열기</span>
                            </div>
                            <span className={styles.optionArrow}>→</span>
                        </button>

                        {/* Option 3 — 주소 복사 */}
                        <button className={styles.option} onClick={handleCopy}>
                            <span className={styles.optionIcon}>📋</span>
                            <div className={styles.optionText}>
                                <span className={styles.optionTitle}>목적지 주소 복사</span>
                                <span className={styles.optionSub}>{copied ? '✅ 복사됨!' : '한국어 주소 클립보드에 복사'}</span>
                            </div>
                        </button>

                        {/* Option 4 — 기사님용 카드 */}
                        <button className={styles.option} onClick={handleAddressCard}>
                            <span className={styles.optionIcon}>🗺️</span>
                            <div className={styles.optionText}>
                                <span className={styles.optionTitle}>기사님용 한국어 주소 카드</span>
                                <span className={styles.optionSub}>화면 보여주기</span>
                            </div>
                            <span className={styles.optionArrow}>→</span>
                        </button>

                        <button className={styles.cancelBtn} onClick={() => setOpen(false)}>취소</button>
                    </div>
                </div>
            )}

            {/* ── 기사님용 주소 카드 모달 ── */}
            {showCard && (
                <div className={styles.overlay} onClick={() => setShowCard(false)}>
                    <div className={styles.addressCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.cardTitle}>🗺️ 기사님, 여기로 가주세요</div>
                        <div className={styles.cardAddress}>{MOCK_NEXT_DEST.nameKo}</div>
                        <div className={styles.cardName}>{MOCK_NEXT_DEST.name}</div>
                        <button className={styles.cardCopyBtn} onClick={async () => {
                            await navigator.clipboard.writeText(MOCK_NEXT_DEST.nameKo);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}>
                            {copied ? '✅ 복사됨' : '📋 주소 복사'}
                        </button>
                        <button className={styles.cardCloseBtn} onClick={() => setShowCard(false)}>닫기</button>
                    </div>
                </div>
            )}
        </>
    );
}
