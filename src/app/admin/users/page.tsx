'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from '../admin.module.css';

interface Profile {
    id: string;
    email: string;
    nickname: string | null;
    is_admin: boolean;
    created_at: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [myId, setMyId] = useState<string>('');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'all' | 'admin'>('all');
    const [search, setSearch] = useState('');
    const [confirmTarget, setConfirmTarget] = useState<Profile | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
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
        init();
    }, []);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('id, email, nickname, is_admin, created_at')
            .order('created_at', { ascending: false });

        if (tab === 'admin') query = query.eq('is_admin', true);

        const { data } = await query;
        setProfiles((data as Profile[]) || []);
        setLoading(false);
    }, [tab]);

    useEffect(() => {
        if (isAdmin) fetchProfiles();
    }, [isAdmin, fetchProfiles]);

    const handleToggle = async () => {
        if (!confirmTarget) return;
        setActionLoading(true);
        await supabase
            .from('profiles')
            .update({ is_admin: !confirmTarget.is_admin })
            .eq('id', confirmTarget.id);
        setConfirmTarget(null);
        await fetchProfiles();
        setActionLoading(false);
    };

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }); }
        catch { return iso; }
    };

    const filtered = profiles.filter(p =>
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        (p.nickname ?? '').toLowerCase().includes(search.toLowerCase())
    );

    // 접근 제어
    if (isAdmin === null) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
    if (isAdmin === false) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--background)', padding: 24 }}>
                <div style={{ fontSize: '3rem' }}>🔒</div>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>관리자 전용 페이지</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', textAlign: 'center' }}>접근 권한이 없습니다.</p>
                <button onClick={() => router.push('/')} style={{ padding: '12px 28px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>홈으로</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--foreground)' }}>←</button>
                <h1 className={styles.headerTitle}>🛡️ 관리자 계정 관리</h1>
                <span className={styles.adminBadge}>ADMIN</span>
            </header>

            {/* Tab */}
            <div className={styles.tabBar}>
                <button className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`} onClick={() => setTab('all')}>
                    👥 전체 회원
                </button>
                <button className={`${styles.tab} ${tab === 'admin' ? styles.tabActive : ''}`} onClick={() => setTab('admin')}>
                    🛡️ 관리자만
                </button>
            </div>

            <div className={styles.content}>
                {/* 검색 */}
                <div className={styles.searchBar}>
                    <span style={{ color: 'var(--gray-400)' }}>🔍</span>
                    <input
                        className={styles.searchInput}
                        placeholder="이메일 또는 닉네임으로 검색"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.9rem' }}>✕</button>
                    )}
                </div>

                {/* 안내 박스 */}
                <div style={{
                    background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)',
                    borderRadius: 12, padding: '10px 14px',
                    fontSize: '0.8rem', color: '#5b21b6', marginBottom: 14, lineHeight: 1.5,
                }}>
                    🛡️ <strong>관리자 권한</strong>을 부여하면 협력업체 승인/거절 및 관리자 관리 페이지에 접근할 수 있습니다.<br />
                    ⚠️ 본인 계정의 권한은 해제할 수 없습니다.
                </div>

                {loading && <div className={styles.empty}>불러오는 중...</div>}

                {!loading && filtered.length === 0 && (
                    <div className={styles.empty}>검색 결과가 없습니다.</div>
                )}

                {!loading && filtered.map((profile, idx) => (
                    <div key={profile.id} className={styles.card}>
                        {/* 아바타 */}
                        <div
                            className={styles.avatar}
                            style={{ background: `hsl(${(idx * 53) % 360}, 65%, 58%)` }}
                        >
                            {(profile.nickname || profile.email || '?')[0].toUpperCase()}
                        </div>

                        <div className={styles.userInfo}>
                            <div className={styles.userName}>
                                {profile.nickname || '(닉네임 없음)'}
                                {profile.id === myId && (
                                    <span style={{ marginLeft: 6, fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>나</span>
                                )}
                            </div>
                            <div className={styles.userEmail}>{profile.email}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: 2 }}>
                                가입: {formatDate(profile.created_at)}
                            </div>
                        </div>

                        {/* 관리자 토글 버튼 */}
                        <button
                            className={`${styles.adminToggle} ${profile.is_admin ? styles.adminOn : styles.adminOff}`}
                            onClick={() => {
                                if (profile.id === myId) return; // 본인 권한 해제 방지
                                setConfirmTarget(profile);
                            }}
                            disabled={profile.id === myId}
                            title={profile.id === myId ? '본인 권한은 변경할 수 없습니다' : ''}
                        >
                            {profile.is_admin ? '🛡️ 관리자' : '일반'}
                        </button>
                    </div>
                ))}
            </div>

            {/* 확인 모달 */}
            {confirmTarget && (
                <div className={styles.confirmModal} onClick={() => setConfirmTarget(null)}>
                    <div className={styles.confirmSheet} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.confirmTitle}>
                            {confirmTarget.is_admin ? '🔓 관리자 권한 해제' : '🛡️ 관리자 권한 부여'}
                        </h3>
                        <p className={styles.confirmDesc}>
                            <strong>{confirmTarget.nickname || confirmTarget.email}</strong> 계정의<br />
                            관리자 권한을 {confirmTarget.is_admin ? '해제' : '부여'}하시겠습니까?
                        </p>
                        <button
                            className={`${styles.confirmBtn} ${confirmTarget.is_admin ? styles.confirmRevoke : styles.confirmGrant}`}
                            onClick={handleToggle}
                            disabled={actionLoading}
                        >
                            {actionLoading ? '처리 중...' : confirmTarget.is_admin ? '권한 해제' : '권한 부여'}
                        </button>
                        <button className={styles.cancelBtn} onClick={() => setConfirmTarget(null)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}
