import React from 'react';
import styles from './TravelPlanTemplates.module.css';
import { TRAVEL_PLAN_TEMPLATES } from './travelPlanData';

export default function TravelPlanTemplates() {
    return (
        <section className={styles.templatesSection}>
            <h2 className={styles.sectionTitle}>Travel Plan Templates</h2>
            <div className={styles.templatesGrid}>
                {TRAVEL_PLAN_TEMPLATES.map((plan) => (
                    <div key={plan.id} className={styles.planCard}>
                        <h3 className={styles.planTitle}>{plan.title}</h3>
                        <p className={styles.planIntro}>{plan.shortIntro}</p>

                        <div className={styles.keywords}>
                            {plan.keywords.map((kw, idx) => (
                                <span key={idx} className={styles.keywordChip}>{kw}</span>
                            ))}
                        </div>

                        <div className={styles.itineraryTitle}>📅 Schedule</div>
                        <div className={styles.itineraryList}>
                            {plan.itinerary.map((item, idx) => (
                                <div key={idx} className={styles.itineraryItem}>
                                    <div className={styles.dayLabel}>{item.label}</div>
                                    <div className={styles.dayDesc}>{item.desc}</div>
                                </div>
                            ))}
                        </div>

                        <button className={styles.actionBtn}>
                            View Details <span className={styles.actionArrow}>→</span>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
