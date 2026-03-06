"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./my.module.css";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useTrip } from "@/lib/contexts/TripContext";
import { supabase } from "@/lib/supabaseClient";

function MyPageContent() {
    const { t } = useTranslation("common");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { itinerary } = useTrip();
    const hasNewBooking = searchParams.get('booked') === 'true';

    const [userName, setUserName] = useState("Jessie Kim");
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [partnerStatus, setPartnerStatus] = useState<null | 'pending' | 'approved' | 'rejected' | 'none'>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.name) setUserName(parsed.name);
            } catch (e) {
                // Ignore parse errors
            }
        }

        // 관리자 여부 확인 + 협력업체 신청 상태 확인
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const email = user.email ?? '';
            setUserEmail(email);

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .maybeSingle();
            if (profile?.is_admin) setIsAdmin(true);

            // 협력업체 신청 상태 확인
            const { data: partner } = await supabase
                .from('partners')
                .select('status')
                .eq('email', email)
                .maybeSingle();

            setPartnerStatus(partner ? partner.status : 'none');
        };
        checkAdmin();
    }, []);

    useEffect(() => {
        const fetchMyPosts = async () => {
            if (!userName) return;
            const { data, error } = await supabase
                .from('community_posts')
                .select('*')
                .eq('author', userName)
                .order('created_at', { ascending: false });

            if (data && !error) {
                setMyPosts(data);
            }
        };
        fetchMyPosts();
    }, [userName]);

    // Get real confirmed bookings from itinerary
    const realBookings = useMemo(() => {
        return itinerary
            .filter(item => item.status === 'confirmed' || item.status === 'submitted')
            .map(item => ({
                id: item.id,
                title: item.name,
                date: item.day ? `Day ${item.day} - ${item.time}` : item.time,
                category: t(`common.categories.${item.type || 'attraction'}`, { defaultValue: item.type || 'Attraction' }),
                status: item.status,
                area: (item as any).area,
                price: (item as any).price,
                isNew: false
            }));
    }, [itinerary, t]);

    // Mock Booking Data
    const mockBookings = [
        ...(hasNewBooking ? [{
            id: "b-sulwhasoo",
            title: "Sulwhasoo Spa Flagship",
            date: t('my_page.bookings.tomorrow_time', { time: '14:30' }),
            category: t('common.categories.beauty'),
            status: "confirmed",
            area: "Gangnam",
            price: "150,000",
            isNew: true
        }] : []),
        {
            id: "a1",
            title: t('explore_items.a1.title', { defaultValue: "Gyeongbokgung Palace" }),
            date: t('my_page.bookings.today_time', { time: '11:00' }),
            category: t('common.categories.attraction'),
            status: "completed",
            area: "Jongno",
            price: "3,000",
            isNew: false
        }
    ];

    const allBookings = [...realBookings, ...mockBookings];

    return (
        <div className={styles.container}>
            {/* Profile Header */}
            <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                        <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                    </div>
                    <div className={styles.levelBadge}>Lv.3</div>
                </div>
                <h1 className="text-2xl font-bold">{userName}</h1>
                <div className={styles.trustScore} suppressHydrationWarning>
                    {t('my_page.profile.trust_score')}: <span className="text-black font-bold">850</span> ({t('my_page.profile.trust_level_excellent')})
                </div>
            </div>

            {/* My Bookings */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4" suppressHydrationWarning>{t('my_page.bookings.title')}</h2>

                {allBookings.map((booking: any) => (
                    <div key={booking.id} className={`${styles.ticket} mb-4`}>
                        <div className={styles.ticketHeader}>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold" suppressHydrationWarning>{booking.category}</div>
                                <div className={`${styles.statusLabel} ${booking.status === 'confirmed' ? styles.confirmed : ''}`} suppressHydrationWarning>
                                    {t(`planner_page.status.${booking.status}`)}
                                </div>
                            </div>
                            <div className={styles.qrCode}></div>
                        </div>
                        <div className={styles.ticketBody}>
                            <h3 className="text-xl font-bold mb-1" suppressHydrationWarning>{booking.title}</h3>
                            <div className="text-sm text-gray-600 mb-2" suppressHydrationWarning>{booking.date}</div>
                            {booking.area && (
                                <div className="text-xs text-gray-400" suppressHydrationWarning>{t('my_page.bookings.area', { defaultValue: 'Area' })}: {booking.area}</div>
                            )}
                            {booking.price && (
                                <div className="text-xs text-gray-400" suppressHydrationWarning>{t('my_page.bookings.price', { defaultValue: 'Price' })}: ₩{booking.price}</div>
                            )}
                            {booking.isNew && (

                                <div className="mt-2 text-xs text-purple font-bold" suppressHydrationWarning>✨ {t('my_page.bookings.new_added', { defaultValue: 'New Booking Added!' })}</div>
                            )}
                        </div>
                        {/* Dotted Line */}
                        <div style={{ padding: '12px 0 8px 0', borderTop: '1px dashed #eee', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '10px', color: '#ccc', letterSpacing: '2px' }}>
                                ID: {booking.id.toString().slice(0, 8).toUpperCase()}
                            </div>
                            <div style={{ height: '20px', display: 'flex', gap: '2px' }}>
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} style={{ width: i % 3 === 0 ? '3px' : '1px', height: '100%', background: '#eee' }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* My Community Posts */}
            <section>
                <h2 className="text-lg font-bold mb-4" suppressHydrationWarning>{t('my_page.community.title', { defaultValue: 'My Community Posts' })}</h2>
                {myPosts.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-6 bg-white rounded-xl shadow-sm border border-gray-100" suppressHydrationWarning>
                        {t('my_page.community.empty', { defaultValue: 'No community posts written yet.' })}
                    </div>
                ) : (
                    <div className={styles.postList}>
                        {myPosts.map(post => (
                            <div key={post.id} className={styles.postCard} onClick={() => router.push(`/community/${post.id}`)}>
                                <div className={styles.postHeader}>
                                    <div className={`${styles.badge} ${styles['badge_' + post.type]}`} suppressHydrationWarning>
                                        {t(`community_page.type.${post.type.toUpperCase()}`, { defaultValue: post.type.toUpperCase() })}
                                    </div>
                                    <div className={styles.postTime}>{post.time}</div>
                                </div>
                                <h3 className={styles.postTitle}>{post.title}</h3>
                                <p className={styles.postDesc}>{post.desc}</p>
                                <div className={styles.postFooter}>
                                    💬 {post.comments}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 협력업체 신청 섹션 */}
            {partnerStatus !== null && (
                <section style={{ marginTop: 28, marginBottom: 4 }}>
                    <h2 className="text-lg font-bold" style={{ marginBottom: 12 }}>🤝 협력업체 신청</h2>

                    {partnerStatus === 'none' && (
                        <div
                            onClick={() => router.push('/auth/partner-signup')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))',
                                border: '1.5px solid rgba(245,158,11,0.3)',
                                borderRadius: 16, padding: '16px 18px',
                                cursor: 'pointer', transition: 'transform 0.15s',
                            }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(245,158,11,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.4rem', flexShrink: 0,
                            }}>🤝</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>파트너로 등록하기</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Kello 협력업체로 가입해 더 많은 여행객에게 소개되세요</div>
                            </div>
                            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 700 }}>›</span>
                        </div>
                    )}

                    {partnerStatus === 'pending' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: 'rgba(245,158,11,0.06)', border: '1.5px solid rgba(245,158,11,0.2)',
                            borderRadius: 16, padding: '16px 18px',
                        }}>
                            <div style={{ fontSize: '1.6rem' }}>⏳</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>심사 중</div>
                                <div style={{ fontSize: '0.78rem', color: '#92400e' }}>신청서를 검토 중입니다. 관리자 승인 후 안내드립니다.</div>
                            </div>
                        </div>
                    )}

                    {partnerStatus === 'approved' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.25)',
                            borderRadius: 16, padding: '16px 18px',
                        }}>
                            <div style={{ fontSize: '1.6rem' }}>✅</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#065f46', marginBottom: 2 }}>협력업체 승인 완료</div>
                                <div style={{ fontSize: '0.78rem', color: '#065f46' }}>Kello 파트너로 등록되었습니다.</div>
                            </div>
                        </div>
                    )}

                    {partnerStatus === 'rejected' && (
                        <div style={{
                            background: 'rgba(239,68,68,0.05)', border: '1.5px solid rgba(239,68,68,0.2)',
                            borderRadius: 16, padding: '16px 18px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <div style={{ fontSize: '1.6rem' }}>❌</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#dc2626', marginBottom: 2 }}>신청 거절됨</div>
                                    <div style={{ fontSize: '0.78rem', color: '#dc2626' }}>신청이 거절되었습니다. 내용 수정 후 재신청하세요.</div>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/auth/partner-signup')}
                                style={{
                                    width: '100%', padding: '10px', background: '#dc2626', color: 'white',
                                    border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem',
                                    cursor: 'pointer',
                                }}
                            >재신청하기</button>
                        </div>
                    )}
                </section>
            )}

            {/* 관리자 전용 섹션 - isAdmin일 때만 표시 */}
            {isAdmin && (
                <section style={{ marginTop: 28 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    }}>
                        <h2 className="text-lg font-bold" style={{ margin: 0 }}>⚙️ 관리자 메뉴</h2>
                        <span style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: 'white', fontSize: '0.68rem', fontWeight: 700,
                            padding: '2px 8px', borderRadius: 999,
                        }}>ADMIN</span>
                    </div>

                    {[
                        { icon: '📊', label: '관리자 대시보드', desc: '통계 및 전체 메뉴', path: '/admin' },
                        { icon: '🤝', label: '협력업체 관리', desc: '가입 신청 승인 · 거절', path: '/admin/partners' },
                        { icon: '🛡️', label: '관리자 계정 관리', desc: '권한 부여 · 해제', path: '/admin/users' },
                    ].map((item) => (
                        <div
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: 'white', borderRadius: 14,
                                border: '1px solid rgba(124,58,237,0.15)',
                                padding: '13px 16px', marginBottom: 8,
                                cursor: 'pointer',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                transition: 'transform 0.15s',
                            }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'rgba(124,58,237,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', flexShrink: 0,
                            }}>{item.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 1 }}>{item.desc}</div>
                            </div>
                            <span style={{ color: 'var(--gray-300)', fontSize: '1rem' }}>›</span>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}

export default function MyPage() {
    return (
        <Suspense fallback={<div className={styles.container}>Loading...</div>}>
            <MyPageContent />
        </Suspense>
    );
}
