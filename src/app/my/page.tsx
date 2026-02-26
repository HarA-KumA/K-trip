"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./my.module.css";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useTrip } from "@/lib/contexts/TripContext";

function MyPageContent() {
    const { t } = useTranslation("common");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { itinerary } = useTrip();
    const hasNewBooking = searchParams.get('booked') === 'true';

    const [userName, setUserName] = useState("Jessie Kim");

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
    }, []);

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
            {/* Settings Icon */}
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                ⚙️
            </div>

            {/* Profile Header */}
            <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                        <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                    </div>
                    <div className={styles.levelBadge}>Lv.3</div>
                </div>
                <h1 className="text-2xl font-bold">{userName}</h1>
                <div className={styles.trustScore}>
                    {t('my_page.profile.trust_score')}: <span className="text-white font-bold">850</span> ({t('my_page.profile.trust_level_excellent')})
                </div>
            </div>

            {/* Passport Stamps */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 flex justify-between">
                    <span>{t('my_page.passport.title')}</span>
                    <span className="text-sm text-purple">{t('my_page.passport.view_all')}</span>
                </h2>
                <div className={styles.passportGrid}>
                    <div className={`${styles.stamp} ${styles.collected}`}>
                        <span>🌆</span>
                        <span>{t('my_page.passport.seoul')}</span>
                    </div>
                    <div className={`${styles.stamp} ${styles.collected}`}>
                        <span>💄</span>
                        <span>{t('my_page.passport.beauty')}</span>
                    </div>
                    <div className={styles.stamp}>
                        <span>🏝️</span>
                        <span>{t('my_page.passport.jeju')}</span>
                    </div>
                </div>
            </section>

            {/* My Bookings */}
            <section>
                <h2 className="text-lg font-bold mb-4">{t('my_page.bookings.title')}</h2>

                {allBookings.map((booking: any) => (
                    <div key={booking.id} className={`${styles.ticket} animate-slide-up mb-4`}>
                        <div className={styles.ticketHeader}>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">{booking.category}</div>
                                <div className={`${styles.statusLabel} ${booking.status === 'confirmed' ? styles.confirmed : ''}`}>
                                    {t(`planner_page.status.${booking.status}`)}
                                </div>
                            </div>
                            <div className={styles.qrCode}></div>
                        </div>
                        <div className={styles.ticketBody}>
                            <h3 className="text-xl font-bold mb-1">{booking.title}</h3>
                            <div className="text-sm text-gray-600 mb-2">{booking.date}</div>
                            {booking.area && (
                                <div className="text-xs text-gray-400">{t('my_page.bookings.area', { defaultValue: 'Area' })}: {booking.area}</div>
                            )}
                            {booking.price && (
                                <div className="text-xs text-gray-400">{t('my_page.bookings.price', { defaultValue: 'Price' })}: ₩{booking.price}</div>
                            )}
                            {booking.isNew && (
                                <div className="mt-2 text-xs text-purple font-bold">✨ {t('my_page.bookings.new_added', { defaultValue: 'New Booking Added!' })}</div>
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
