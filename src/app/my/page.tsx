"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./my.module.css";
import Image from "next/image";

function MyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasNewBooking = searchParams.get('booked') === 'true';

    // Mock Booking Data
    const bookings = [
        ...(hasNewBooking ? [{
            id: "new-1",
            title: "Jenny House Cheongdam",
            date: "Tomorrow, 14:30",
            category: "Beauty",
            status: "confirmed",
            isNew: true
        }] : []),
        {
            id: "b1",
            title: "Tamburins Pop-up",
            date: "Today, 11:00",
            category: "Activity",
            status: "completed",
            isNew: false
        },
        {
            id: "b2",
            title: "KTX to Busan",
            date: "Next Week, 09:00",
            category: "Transport",
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
                        {/* Placeholder for user image */}
                        <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                    </div>
                    <div className={styles.levelBadge}>Pv.3</div>
                </div>
                <h1 className="text-2xl font-bold">Jessie Kim</h1>
                <div className={styles.trustScore}>
                    💎 Trust Score: <span className="text-white font-bold">850</span> (Excellent)
                </div>
            </div>

            {/* Passport Stamps */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 flex justify-between">
                    <span>My Passport</span>
                    <span className="text-sm text-purple">View All</span>
                </h2>
                <div className={styles.passportGrid}>
                    <div className={`${styles.stamp} ${styles.collected}`}>
                        <span>🌆</span>
                        <span>Seoul</span>
                    </div>
                    <div className={`${styles.stamp} ${styles.collected}`}>
                        <span>💄</span>
                        <span>Beauty</span>
                    </div>
                    <div className={styles.stamp}>
                        <span>🏝️</span>
                        <span>Jeju</span>
                    </div>
                </div>
            </section>

            {/* My Bookings */}
            <section>
                <h2 className="text-lg font-bold mb-4">My Bookings</h2>

                {bookings.map((booking) => (
                    <div key={booking.id} className={`${styles.ticket} animate-slide-up`}>
                        <div className={styles.ticketHeader}>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">{booking.category}</div>
                                <div className={`statusLabel ${booking.status === 'confirmed' ? styles.confirmed : ''}`}>
                                    {booking.status === 'confirmed' ? 'Confirmed' : 'Completed'}
                                </div>
                            </div>
                            <div className={styles.qrCode}></div>
                        </div>
                        <div className={styles.ticketBody}>
                            <h3 className="text-xl font-bold mb-1">{booking.title}</h3>
                            <div className="text-sm text-gray-600">{booking.date}</div>
                            {booking.isNew && (
                                <div className="mt-2 text-xs text-purple font-bold">✨ New Booking Added!</div>
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
