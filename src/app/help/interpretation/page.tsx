'use client';

import { useRouter } from 'next/navigation';

const services = [
    {
        icon: '☎️',
        title: '1330 Korea Travel Hotline',
        desc: 'Available in English, Japanese, Chinese, and more. 24/7 travel assistance.',
        color: '#8b5cf6',
        action: { label: '📞 Call 1330', href: 'tel:1330' },
    },
    {
        icon: '🌐',
        title: 'Naver Papago',
        desc: 'Best free translator for Korean. Works offline with camera translate mode.',
        color: '#10b981',
        action: { label: 'Open App Store', href: 'https://papago.naver.com', external: true },
    },
    {
        icon: '🌍',
        title: 'Google Translate',
        desc: 'Supports voice, camera, and conversation mode. Available offline.',
        color: '#3b82f6',
        action: { label: 'Open App Store', href: 'https://translate.google.com', external: true },
    },
    {
        icon: '💬',
        title: '120 Seoul Dasan Call Center',
        desc: 'Seoul city service in English/Chinese/Japanese for general inquiries.',
        color: '#f59e0b',
        action: { label: '📞 Call 120', href: 'tel:120' },
    },
];

const phrases = [
    { kr: '한국어를 못해요', rom: 'Hanguk-eo-reul mot-hae-yo', en: "I don't speak Korean." },
    { kr: '영어 하시나요?', rom: 'Yeong-eo ha-si-na-yo?', en: 'Do you speak English?' },
    { kr: '통역사가 필요해요', rom: 'Tong-yeok-sa-ga pil-yo-hae-yo', en: 'I need an interpreter.' },
    { kr: '천천히 말씀해 주세요', rom: 'Cheon-cheon-hi mal-sseum-hae ju-se-yo', en: 'Please speak slowly.' },
];

export default function InterpretationPage() {
    const router = useRouter();
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 100 }}>
            <header style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '20px 20px 24px', color: 'white' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', marginBottom: 8 }}>←</button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>🌐 Interpretation</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '0.9rem' }}>Translation services & language help</p>
            </header>

            <div style={{ padding: '20px 20px 0' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>📡 Translation Services</h2>
                {services.map((s, i) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: 16, padding: '16px',
                        marginBottom: 12, border: `2px solid ${s.color}20`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '2rem', flexShrink: 0 }}>{s.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: s.color }}>{s.title}</div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
                                <a
                                    href={s.action.href}
                                    target={s.action.external ? '_blank' : undefined}
                                    rel={s.action.external ? 'noopener noreferrer' : undefined}
                                    style={{
                                        display: 'inline-block', marginTop: 10, background: s.color + '15',
                                        color: s.color, padding: '7px 14px', borderRadius: 20,
                                        fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none'
                                    }}
                                >
                                    {s.action.label}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '24px 0 12px' }}>🗣 Useful Phrases</h2>
                {phrases.map((p, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 10, border: '2px solid #f5f3ff' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#8b5cf6' }}>{p.kr}</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0' }}>{p.rom}</div>
                        <div style={{ fontSize: '0.88rem', color: '#374151' }}>🇺🇸 {p.en}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
