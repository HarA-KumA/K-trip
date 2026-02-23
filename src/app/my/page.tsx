"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./my.module.css";
import Image from "next/image";
import { useTranslation } from "react-i18next";

function MyPageContent() {
    const { t } = useTranslation("common");
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasNewBooking = searchParams.get('booked') === 'true';

    // Mock Booking Data
    const bookings = [
        ...(hasNewBooking ? [{
            id: "b1", // Using b1 as it exists in explore_items
            title: t('explore_items.b1.title', { defaultValue: "Jenny House Cheongdam" }),
            date: t('my_page.bookings.tomorrow_time', { time: '14:30' }),
            category: t('common.categories.beauty'),
            status: "confirmed",
            isNew: true
        }] : []),
        {
            id: "a1", // Gyeongbokgung
            title: t('explore_items.a1.title', { defaultValue: "Gyeongbokgung Palace" }),
            date: t('my_page.bookings.today_time', { time: '11:00' }),
            category: t('common.categories.attraction'),
            status: "completed",
            isNew: false
        },
        {
            id: "t1", // Transport (Placeholder)
            title: t('explore_items.t1.title', { defaultValue: "KTX to Busan" }),
            date: t('my_page.bookings.next_week_time', { time: '09:00' }),
            category: t('common.categories.transport'),
            status: "confirmed",
            isNew: false
        }
    ];

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
                <h1 className="text-2xl font-bold">Jessie Kim</h1>
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

                {bookings.map((booking) => (
                    <div key={booking.id} className={`${styles.ticket} animate-slide-up`}>
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
                            <div className="text-sm text-gray-600">{booking.date}</div>
                            {booking.isNew && (
                                <div className="mt-2 text-xs text-purple font-bold">✨ {t('my_page.bookings.new_added')}</div>
                            )}
                        </div>
                        {/* Dotted Line */}
                        <div style={{ position: 'absolute', top: '70%', left: 0, right: 0, borderTop: '2px dashed #ddd' }}></div>
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
