'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './planner.module.css';
import {
    MOCK_TRIP_DAYS,
    MOCK_PLAN_CARDS,
    SLOTS,
    SUGGESTION_ITEMS,
    TYPE_COLORS,
    TripDay,
    PlanCard,
    SlotType,
} from './mock/data';

// ─── helper ──────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: PlanCard['type'] }) {
    const c = TYPE_COLORS[type];
    return (
        <span
            className={styles.typeBadge}
            style={{ background: c.bg, color: c.text }}
        >
            {type}
        </span>
    );
}

// ─── Plan Card Component ──────────────────────────────────────────────────────
function PlanCardItem({
    card,
    onRemove,
}: {
    card: PlanCard;
    onRemove: () => void;
}) {
    return (
        <div className={styles.planCard}>
            <div
                className={styles.cardColorBar}
                style={{ background: card.image_color || '#555' }}
            />
            <div className={styles.cardBody}>
                <div className={styles.cardTopRow}>
                    <TypeBadge type={card.type} />
                    <span className={styles.cardTitle}>{card.title}</span>
                </div>
                <div className={styles.cardMeta}>
                    {card.area}
                    {card.start_time && <> · {card.start_time}</>}
                    {card.duration_min && <> · {card.duration_min}min</>}
                </div>
                <div className={styles.cardBadges}>
                    {card.badges.map((b) => (
                        <span key={b} className={styles.miniBadge}>{b}</span>
                    ))}
                </div>
            </div>
            <button className={styles.cardRemove} onClick={onRemove} title="Remove">
                ×
            </button>
        </div>
    );
}

// ─── Slot Component ───────────────────────────────────────────────────────────
function SlotSection({
    slotType,
    label,
    icon,
    cards,
    onRemove,
    onOpenDrawer,
}: {
    slotType: SlotType;
    label: string;
    icon: string;
    cards: PlanCard[];
    onRemove: (id: string) => void;
    onOpenDrawer: (slot: SlotType) => void;
}) {
    return (
        <div className={styles.slotSection}>
            <div className={styles.slotHeader}>
                <span className={styles.slotIcon}>{icon}</span>
                <span className={styles.slotLabel}>{label}</span>
                <span className={styles.slotCount}>{cards.length} / 3</span>
            </div>
            <div className={styles.slotBody}>
                {cards.map((card) => (
                    <PlanCardItem
                        key={card.id}
                        card={card}
                        onRemove={() => onRemove(card.id)}
                    />
                ))}
                {cards.length < 3 && (
                    <div
                        className={styles.emptySlot}
                        onClick={() => onOpenDrawer(slotType)}
                    >
                        <span>+</span>
                        <span>Add to {label}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Suggestion Drawer ────────────────────────────────────────────────────────
type DrawerTab = 'near' | 'before' | 'after' | 'match';

function SuggestionDrawer({
    day,
    targetSlot,
    onAdd,
}: {
    day: TripDay;
    targetSlot: SlotType | null;
    onAdd: (item: (typeof SUGGESTION_ITEMS.near)[0], slot: SlotType) => void;
}) {
    const [activeTab, setActiveTab] = useState<DrawerTab>('near');

    const tabs: { key: DrawerTab; label: string }[] = [
        { key: 'near', label: `📍 Near ${day.city_label}` },
        { key: 'before', label: '⏪ Before' },
        { key: 'after', label: '⏩ After' },
        { key: 'match', label: '✅ Match' },
    ];

    const items = SUGGESTION_ITEMS[activeTab];

    return (
        <div className={styles.drawer}>
            <div className={styles.drawerHandle}>
                <div className={styles.handleBar} />
            </div>

            {/* Tabs */}
            <div className={styles.drawerTabs}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        className={`${styles.drawerTab} ${activeTab === t.key ? styles.active : ''}`}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Horizontal list */}
            <div className={styles.drawerList}>
                {items.map((item) => (
                    <div key={item.id} className={styles.suggestionCard}>
                        <div
                            className={styles.suggestionThumb}
                            style={{ background: item.image_color || '#333' }}
                        >
                            <TypeBadge type={item.type} />
                        </div>
                        <div className={styles.suggestionInfo}>
                            <div className={styles.suggestionTitle}>{item.title}</div>
                            <div className={styles.suggestionArea}>{item.area}</div>
                            <button
                                className={styles.suggAddBtn}
                                onClick={() =>
                                    onAdd(item, targetSlot ?? 'am')
                                }
                            >
                                + Add to {targetSlot?.toUpperCase() ?? 'AM'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlannerPage() {
    const router = useRouter();

    const [activeDay, setActiveDay] = useState(1);
    const [boardCards, setBoardCards] = useState(MOCK_PLAN_CARDS);
    const [targetSlot, setTargetSlot] = useState<SlotType | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingCard, setBookingCard] = useState<PlanCard | null>(null);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'accepted' | 'unavailable'>("idle");
    const [bookingForm, setBookingForm] = useState({ date: '', people: '2', note: '' });

    const currentDay = MOCK_TRIP_DAYS.find((d) => d.day === activeDay)!;

    // ── helpers ───────────────────────────────────────────────────────────────
    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }, []);

    const removeCard = (day: number, slot: SlotType, cardId: string) => {
        setBoardCards((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slot]: prev[day][slot].filter((c) => c.id !== cardId),
            },
        }));
    };

    const addSuggestion = (
        item: (typeof SUGGESTION_ITEMS.near)[0],
        slot: SlotType,
    ) => {
        const existing = boardCards[activeDay][slot];
        if (existing.length >= 3) {
            showToast('Slot is full (max 3)');
            return;
        }

        const newCard: PlanCard = {
            id: `sg_${item.id}_${Date.now()}`,
            item_id: item.id,
            title: item.title,
            type: item.type,
            area: item.area,
            image_color: item.image_color,
            badges: item.badges,
        };

        setBoardCards((prev) => ({
            ...prev,
            [activeDay]: {
                ...prev[activeDay],
                [slot]: [...prev[activeDay][slot], newCard],
            },
        }));
        showToast(`Added to Day ${activeDay} · ${slot.toUpperCase()}`);
    };

    const autoBuildDay = () => {
        const templates: Record<SlotType, PlanCard> = {
            am: {
                id: `auto_am_${Date.now()}`,
                item_id: 'a1',
                title: 'Gyeongbokgung Palace',
                type: 'attraction',
                area: 'Jongno',
                image_color: '#ccffcc',
                badges: ['History'],
            },
            pm: {
                id: `auto_pm_${Date.now()}`,
                item_id: 'f1',
                title: 'Plant Cafe Seoul',
                type: 'food',
                area: 'Itaewon',
                image_color: '#aaddaa',
                badges: ['Vegan'],
            },
            night: {
                id: `auto_ni_${Date.now()}`,
                item_id: 'fs1',
                title: 'Seoul Lantern Festival',
                type: 'festival',
                area: 'Gwanghwamun',
                image_color: '#ffffaa',
                badges: ['Free'],
            },
        };

        setBoardCards((prev) => ({
            ...prev,
            [activeDay]: {
                am: [templates.am],
                pm: [templates.pm],
                night: [templates.night],
            },
        }));
        showToast('✨ Auto-built Day ' + activeDay);
    };

    // ── Booking handlers ──────────────────────────────────────────────────────
    const handleOpenBooking = useCallback((card: PlanCard) => {
        setBookingCard(card);
        setBookingStatus('idle');
        setBookingForm({ date: '', people: '2', note: '' });
        setBookingOpen(true);
    }, []);

    const handleBookingSubmit = useCallback(() => {
        setBookingStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            // Randomly simulate unavailable (30% chance) for demo
            const unavail = Math.random() < 0.3;
            setBookingStatus(unavail ? 'unavailable' : 'accepted');
        }, 1800);
    }, []);

    // ── render ────────────────────────────────────────────────────────────────
    const daySlots = boardCards[activeDay];

    return (
        <div className={styles.container}>
            {/* ── Trip Strip ─────────────────────────────── */}
            <div className={styles.tripStrip}>
                {MOCK_TRIP_DAYS.map((day) => (
                    <div
                        key={day.day}
                        className={`${styles.dayTab} ${activeDay === day.day ? styles.active : ''}`}
                        onClick={() => setActiveDay(day.day)}
                    >
                        <span className={styles.dayLabel}>Day {day.day}</span>
                        <span className={styles.cityLabel}>{day.city_label}</span>
                    </div>
                ))}
            </div>

            {/* ── Day Board ──────────────────────────────── */}
            <div className={styles.dayBoard}>
                {/* CTAs */}
                <div className={styles.boardActions}>
                    <button
                        className={`${styles.ctaBtn} ${styles.ctaDiscover}`}
                        onClick={() =>
                            router.push(`/explore?city=${currentDay.city_id}`)
                        }
                    >
                        🔍 Add from Discover
                    </button>
                    <button
                        className={`${styles.ctaBtn} ${styles.ctaAuto}`}
                        onClick={autoBuildDay}
                    >
                        ✨ Auto-build
                    </button>
                </div>

                {/* Slots */}
                {SLOTS.map(({ type, label, icon }) => (
                    <SlotSection
                        key={type}
                        slotType={type}
                        label={label}
                        icon={icon}
                        cards={daySlots[type]}
                        onRemove={(id) => removeCard(activeDay, type, id)}
                        onOpenDrawer={(slot) => setTargetSlot(slot)}
                    />
                ))}

                {/* ── Book All Button ── */}
                <button
                    className={styles.bookAllBtn}
                    onClick={() => {
                        const allCards = [...daySlots.am, ...daySlots.pm, ...daySlots.night];
                        if (allCards.length > 0) handleOpenBooking(allCards[0]);
                        else showToast('먼저 일정을 추가해주세요');
                    }}
                >
                    🎫 이 일정 예약 요청하기
                </button>
            </div>

            {/* ── Suggestion Drawer ──────────────────────── */}
            <SuggestionDrawer
                day={currentDay}
                targetSlot={targetSlot}
                onAdd={addSuggestion}
            />

            {/* ── Toast ──────────────────────────────────── */}
            {toast && <div className={styles.toast}>{toast}</div>}

            {/* ── Booking Bottom Sheet ── */}
            {bookingOpen && (
                <div className={styles.bookingOverlay} onClick={() => setBookingOpen(false)}>
                    <div className={styles.bookingSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.sheetHandle} />

                        {bookingStatus === 'accepted' ? (
                            <div className={styles.bookingResult}>
                                <div className={styles.resultIcon}>✅</div>
                                <div className={styles.resultTitle}>예약 요청 접수!</div>
                                <div className={styles.resultDesc}>
                                    담당자가 확인 후 24시간 내 연락드립니다.<br />
                                    예약번호: <strong>KT-{Math.floor(Math.random() * 9000 + 1000)}</strong>
                                </div>
                                <button className={styles.bookingCloseBtn} onClick={() => { setBookingOpen(false); router.push('/my'); }}>
                                    예약 상태 보러가기
                                </button>
                            </div>
                        ) : bookingStatus === 'unavailable' ? (
                            <div className={styles.bookingResult}>
                                <div className={styles.resultIcon}>⚠️</div>
                                <div className={styles.resultTitle}>해당 시간 예약 불가</div>
                                <div className={styles.resultDesc}>대신 이 3곳을 추천드려요</div>
                                <div className={styles.altList}>
                                    {['그린스파 홍대점 · 10:00 가능', '뷰티크 강남 · 11:30 가능', '아모레 성수 · 13:00 가능'].map((alt, i) => (
                                        <button key={i} className={styles.altItem} onClick={() => { setBookingStatus('accepted'); }}>
                                            <span className={styles.altNum}>{i + 1}</span>
                                            <span>{alt}</span>
                                            <span className={styles.altArrow}>→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.sheetTitle}>
                                    🎫 예약 요청
                                </div>
                                {bookingCard && (
                                    <div className={styles.sheetTarget}>{bookingCard.title}</div>
                                )}
                                <div className={styles.bookingForm}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>날짜</label>
                                        <input
                                            type="date"
                                            className={styles.formInput}
                                            value={bookingForm.date}
                                            onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>인원</label>
                                        <div className={styles.peopleRow}>
                                            {['1', '2', '3', '4+'].map(n => (
                                                <button
                                                    key={n}
                                                    className={`${styles.peopleChip} ${bookingForm.people === n ? styles.peopleChipActive : ''}`}
                                                    onClick={() => setBookingForm(f => ({ ...f, people: n }))}
                                                >{n}명</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>요청사항 (선택)</label>
                                        <textarea
                                            className={styles.formTextarea}
                                            placeholder="알레르기, 선호사항 등"
                                            value={bookingForm.note}
                                            onChange={e => setBookingForm(f => ({ ...f, note: e.target.value }))}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <button
                                    className={styles.bookingSubmitBtn}
                                    disabled={bookingStatus === 'submitting'}
                                    onClick={handleBookingSubmit}
                                >
                                    {bookingStatus === 'submitting' ? '요청 중...' : '예약 요청 제출'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
