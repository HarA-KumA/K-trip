'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './admin-accounts.module.css';

interface Profile {
    id: string;
    email: string;
    nickname: string | null;
    is_admin: boolean;
    created_at: string;
}

export default function AdminAccountsPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toggling, setToggling] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [myId, setMyId] = useState<string | null>(null);

    // 관리자 여부 확인
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setIsAdmin(false); return; }
            setMyId(user.id);

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .maybeSingle();

            setIsAdmin(profile?.is_admin === true);
        };
        checkAdmin();
    }, []);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, nickname, is_admin, created_at')
            .order('created_at', { ascending: false });

        if (!error) setProfiles((data as Profile[]) || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isAdmin) fetchProfiles();
    }, [isAdmin, fetchProfiles]);

    const handleToggleAdmin = async (profile: Profile) => {
        // 본인 권한은 해제 불가
        if (profile.id === myId && profile.is_admin) return;

        setToggling(profile.id);
        await supabase
            .from('profiles')
            .update({ is_admin: !profile.is_admin })
            .eq('id', profile.id);
        await fetchProfiles();
        setToggling(null);
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return iso; }
    };

    // 접근 제한
    if (isAdmin === false) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 16, background: 'var(--background)', padding: 24,
            }}>
                <div style={{ fontSize: '3rem' }}>🔒</div>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>관리자 전용 페이지</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', textAlign: 'center' }}>
                    이 페이지는 관리자만 접근할 수 있습니다.
                </p>
                <button
                    onClick={() => router.push('/')}
                    style={{
                        padding: '12px 28px', background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer',
                    }}
                >홈으로 이동</button>
            </div>
        );
    }

    if (isAdmin === null) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--background)',
            }}>
                <div style={{
                    width: 36, height: 36, border: '3px solid #6366f1',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const filtered = profiles.filter(p =>
        (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.nickname || '').toLowerCase().includes(search.toLowerCase())
    );

    const adminCount = profiles.filter(p => p.is_admin).length;
    const totalCount = profiles.length;

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <header className={styles.header}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--foreground)' }}
                >←</button>
                <h1 className={styles.headerTitle}>👤 계정 관리</h1>
                <span className={styles.badge}>관리자</span>
            </header>

            {/* 검색창 */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="🔍 이름 또는 이메일로 검색..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* 통계 */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statNum} style={{ color: 'var(--foreground)' }}>{totalCount}</div>
                    <div className={styles.statLabel}>전체 회원</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNum} style={{ color: '#6366f1' }}>{adminCount}</div>
                    <div className={styles.statLabel}>관리자</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNum} style={{ color: 'var(--gray-400)' }}>{totalCount - adminCount}</div>
                    <div className={styles.statLabel}>일반 회원</div>
                </div>
            </div>

            {/* 회원 목록 */}
            <div className={styles.content}>
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
                        불러오는 중...
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className={styles.empty}>검색 결과가 없습니다.</div>
                )}

                {!loading && filtered.map((profile, idx) => (
                    <div key={profile.id} className={styles.card}>
                        {/* 아바타 */}
                        <div
                            className={styles.avatar}
                            style={{ background: `hsl(${(idx * 53) % 360}, 65%, 55%)` }}
                        >
                            {(profile.nickname || profile.email || '?')[0].toUpperCase()}
                        </div>

                        {/* 정보 */}
                        <div className={styles.info}>
                            <div className={styles.name}>
                                {profile.nickname || '(닉네임 없음)'}
                                {profile.id === myId && (
                                    <span className={styles.selfBadge} style={{ marginLeft: 6 }}>나</span>
                                )}
                            </div>
                            <div className={styles.email}>{profile.email}</div>
                            <div className={styles.date}>가입: {formatDate(profile.created_at)}</div>
                        </div>

                        {/* 관리자 토글 */}
                        <div className={styles.toggle}>
                            <button
                                className={`${styles.toggleBtn} ${profile.is_admin ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                                onClick={() => handleToggleAdmin(profile)}
                                disabled={toggling === profile.id || (profile.id === myId && profile.is_admin)}
                                title={profile.id === myId && profile.is_admin ? '본인 권한은 해제할 수 없습니다' : ''}
                            >
                                <div className={`${styles.toggleKnob} ${profile.is_admin ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                            </button>
                            <span className={`${styles.toggleLabel} ${profile.is_admin ? styles.toggleLabelOn : styles.toggleLabelOff}`}>
                                {profile.is_admin ? '관리자' : '일반'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
