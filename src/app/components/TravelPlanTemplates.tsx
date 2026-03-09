'use client';

import React, { useState } from 'react';
import styles from './TravelPlanTemplates.module.css';
import { TRAVEL_PLAN_TEMPLATES } from './travelPlanData';

export default function TravelPlanTemplates() {
    const [activeTab, setActiveTab] = useState(TRAVEL_PLAN_TEMPLATES[0].id);

    const activePlan = TRAVEL_PLAN_TEMPLATES.find(p => p.id === activeTab) || TRAVEL_PLAN_TEMPLATES[0];

    return (
        <section className={styles.templatesSection}>
            <h2 className={styles.sectionTitle} style={{ display: 'none' }}>Travel Plan Templates</h2>

            <div className={styles.tabContainer}>
                {TRAVEL_PLAN_TEMPLATES.map((plan) => (
                    <button
                        key={plan.id}
                        className={`${styles.tabBtn} ${activeTab === plan.id ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab(plan.id)}
                    >
                        {plan.id.includes('3') ? '3일차 코스' : '5일차 코스'}
                    </button>
                ))}
            </div>

            <div className={styles.planCardContainer}>
                <div className={styles.planContentScroll}>
                    <h3 className={styles.planTitle}>{activePlan.title}</h3>
                    <p className={styles.planIntro}>{activePlan.shortIntro}</p>

                    <div className={styles.keywords}>
                        {activePlan.keywords.map((kw, idx) => (
                            <span key={idx} className={styles.keywordChip}>{kw}</span>
                        ))}
                    </div>

                    <div className={styles.itineraryTitle}>📅 Schedule</div>
                    <div className={styles.itineraryList}>
                        {activePlan.itinerary.map((item, idx) => (
                            <div key={idx} className={styles.itineraryItem}>
                                <div className={styles.dayLabel}>{item.label}</div>
                                <div className={styles.dayDesc}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <button className={styles.actionBtn}>
                        View Details <span className={styles.actionArrow}>→</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
