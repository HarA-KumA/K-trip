'use client';

import { useRouter } from 'next/navigation';

const policeInfo = [
    { label: 'Report Crime / Emergency', number: '112', icon: '🚔', note: 'Available 24/7. Interpretation available.' },
    { label: 'Tourist Police HotLine', number: '1330', icon: '🌐', note: 'EN / JA / ZH / more languages' },
    { label: 'Nearest Police Station Search', number: null, icon: '📍', url: 'https://www.police.go.kr', urlLabel: 'police.go.kr' },
];

const phrases = [
    { kr: '도와주세요!', rom: 'Do-wa-ju-se-yo!', en: 'Help me!' },
    { kr: '경찰을 불러주세요', rom: 'Gyeong-chal-eul bul-leo-ju-se-yo', en: 'Please call the police.' },
    { kr: '소매치기를 당했어요', rom: 'So-mae-chi-gi-reul dang-hae-sseo-yo', en: 'I was pickpocketed.' },
    { kr: '사진을 찍지 마세요', rom: 'Sa-jin-eul jjik-ji ma-se-yo', en: "Don't take photos of me." },
];

export default function PolicePage() {
    const router = useRouter();
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 100 }}>
            <header style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '20px 20px 24px', color: 'white' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', marginBottom: 8 }}>←</button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>🚔 Police / Crime</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '0.9rem' }}>Report & get police assistance</p>
            </header>

            <div style={{ padding: '20px 20px 0' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>📞 Key Contacts</h2>
                {policeInfo.map((p, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <span style={{ fontSize: '1.6rem' }}>{p.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{p.label}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{p.note}</div>
                        </div>
                        {p.number ? (
                            <a href={`tel:${p.number}`} style={{ background: '#eff6ff', color: '#3b82f6', padding: '8px 14px', borderRadius: 20, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>📲 {p.number}</a>
                        ) : (
                            <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ background: '#eff6ff', color: '#3b82f6', padding: '8px 14px', borderRadius: 20, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>{p.urlLabel} →</a>
                        )}
                    </div>
                ))}

                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '24px 0 12px' }}>🗣 Emergency Phrases</h2>
                {phrases.map((p, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 10, border: '2px solid #eff6ff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6' }}>{p.kr}</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0' }}>{p.rom}</div>
                        <div style={{ fontSize: '0.88rem', color: '#374151' }}>🇺🇸 {p.en}</div>
                    </div>
                ))}

                <div style={{ background: '#eff6ff', borderRadius: 14, padding: 16, marginTop: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>ℹ️ Tourist Police</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                        Tourist Police officers are stationed at Myeongdong, Insadong, and Itaewon areas. They speak multiple languages and can assist with theft, scams, and accidents.
                    </div>
                </div>
            </div>
        </div>
    );
}
