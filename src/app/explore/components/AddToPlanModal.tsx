'use client';

import styles from '../explore.module.css';

interface AddToPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDay: (day: number) => void;
    itemTitle: string;
}

export default function AddToPlanModal({ isOpen, onClose, onSelectDay, itemTitle }: AddToPlanModalProps) {
    if (!isOpen) return null;

    const days = [1, 2, 3, 4, 5]; // MVP hardcoded

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
                <div className={styles.sheetHeader}>
                    <h3>Add to Plan</h3>
                    <button onClick={onClose} className={styles.closeBtn}>X</button>
                </div>
                <div className={styles.sheetContent}>
                    <p className={styles.sheetSubTitle}>Adding <strong>{itemTitle}</strong> to...</p>
                    <div className={styles.dayList}>
                        {days.map(day => (
                            <button
                                key={day}
                                className={styles.dayOption}
                                onClick={() => {
                                    onSelectDay(day);
                                    onClose();
                                }}
                            >
                                <span className={styles.dayIcon}>📅</span>
                                Day {day}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
