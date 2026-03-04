'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const whereOptions = [
    {
        id: 'taxi', icon: '🚕', label: 'Taxi', steps: [
            { title: '1. Check your card receipt', desc: 'Your card issuer records the taxi company. Call them to get the taxi number.' },
            { title: '2. Kakao T App', desc: 'If you used Kakao T, go to your trip history and contact the driver directly.' },
            { title: '3. Report to Police', desc: 'Call 112 and report the lost item with the taxi number and time of ride.' },
            { title: '4. Taxi Lost Item Center', desc: 'Seoul Taxi Association: 02-414-8090 (Korean only — use 1330 for interpretation).' },
        ]
    },
    {
        id: 'subway', icon: '🚇', label: 'Subway', steps: [
            { title: '1. Go to Lost & Found office', desc: 'Each subway line has a lost & found office at major stations (e.g. Line 2 → Sindorim Station).' },
            { title: '2. Seoul Metro Lost Item Site', desc: 'Visit: lost112.go.kr or call 1577-1234 for Seoul Metro.' },
            { title: '3. File online report', desc: 'You can file a report in English at the official lost112 website.' },
        ]
    },
    {
        id: 'airport', icon: '✈️', label: 'Airport', steps: [
            { title: '1. Incheon Airport Lost & Found', desc: 'Terminal 1: 032-741-3110 / Terminal 2: 032-741-3119. Open 24/7.' },
            { title: '2. Gimpo Airport', desc: 'Call: 02-2660-2536. Located at B1F (Domestic) / 3F (International).' },
            { title: '3. Report to Airport Police', desc: 'Airport Police assists 24/7. Counters are in arrivals hall.' },
        ]
    },
    {
        id: 'street', icon: '🛤️', label: 'Street', steps: [
            { title: '1. Retrace your steps', desc: 'Most shops and restaurants have a safe place for found items. Ask the nearest store.' },
            { title: '2. Report to nearest Police box', desc: '(파출소 pach ul-so) — Police officers have translators.' },
            { title: '3. Call 112', desc: 'Report your lost item. Officers can check CCTV footage in many areas.' },
        ]
    },
];

export default function LostFoundPage() {
    const router = useRouter();
    const [step, setStep] = useState<'where' | 'steps'>('where');
    const [selected, setSelected] = useState<typeof whereOptions[0] | null>(null);

    const handleSelect = (place: typeof whereOptions[0]) => {
        setSelected(place);
        setStep('steps');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 100 }}>
            {/* Header */}
            <header style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '20px 20px 24px', color: 'white' }}>
                <button onClick={step === 'steps' ? () => setStep('where') : () => router.back()} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', marginBottom: 8 }}>←</button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>🔍 Lost & Found</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '0.9rem' }}>Step-by-step recovery guide</p>
            </header>

            {step === 'where' ? (
                <div style={{ padding: '24px 20px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Step 1: Where did you lose it?</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>Select the location to see the recovery steps.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {whereOptions.map(place => (
                            <button
                                key={place.id}
                                onClick={() => handleSelect(place)}
                                style={{
                                    padding: '28px 16px', borderRadius: 20, border: '2px solid #e2e8f0',
                                    background: 'white', cursor: 'pointer', textAlign: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.15s'
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{place.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{place.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Extra links */}
                    <div style={{ marginTop: 28 }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Quick Links</h2>
                        {[
                            { label: '🌐 Lost112 Official Site', url: 'https://www.lost112.go.kr', color: '#3b82f6' },
                            { label: '🛂 Passport Lost - Embassy Finder', url: 'https://www.mofa.go.kr/eng/wpge/m_5484/contents.do', color: '#8b5cf6' },
                            { label: '📞 1330 Travel Helpline (EN/JA/ZH)', url: 'tel:1330', color: '#f59e0b' },
                        ].map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'white', borderRadius: 14, padding: '14px 16px',
                                    marginBottom: 10, border: `2px solid ${link.color}30`,
                                    color: link.color, fontWeight: 700, fontSize: '0.9rem',
                                    textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                                }}
                            >
                                {link.label}
                                <span>→</span>
                            </a>
                        ))}
                    </div>
                </div>
            ) : (
                selected && (
                    <div style={{ padding: '24px 20px' }}>
                        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 8 }}>{selected.icon}</div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
                            Lost item in: <span style={{ color: '#f59e0b' }}>{selected.label}</span>
                        </h2>

                        {selected.steps.map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'white', borderRadius: 16, padding: '18px 16px',
                                    marginBottom: 12, border: '1px solid #e2e8f0',
                                    borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: 6 }}>{s.title}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{s.desc}</div>
                            </div>
                        ))}

                        <a
                            href="https://www.lost112.go.kr"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block', marginTop: 16, background: '#f59e0b', color: 'white',
                                textAlign: 'center', padding: '16px', borderRadius: 14,
                                fontWeight: 700, fontSize: '1rem', textDecoration: 'none'
                            }}
                        >
                            🌐 Go to Lost112 Official Report Site
                        </a>
                    </div>
                )
            )}
        </div>
    );
}
