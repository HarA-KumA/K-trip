'use client';

import { useState } from 'react';
import styles from '../explore.module.css';
import { CategoryId } from '../mock/data';

interface FilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    category: string; // "all" | CategoryId
    onApply: (filters: Record<string, string[]>) => void;
}

export default function FilterSheet({ isOpen, onClose, category, onApply }: FilterSheetProps) {
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

    // Mock filter options based on category
    const renderFilters = () => {
        switch (category) {
            case 'beauty':
                return (
                    <>
                        <h4>Show</h4>
                        <div className={styles.filterSection}>
                            {['Skin Care', 'Hair & Makeup', 'Spa', 'Nails'].map(opt => (
                                <button className={styles.filterChip} key={opt}>{opt}</button>
                            ))}
                        </div>
                        <h4>Price</h4>
                        <div className={styles.filterSection}>
                            {['₩', '₩₩', '₩₩₩'].map(opt => (
                                <button className={styles.filterChip} key={opt}>{opt}</button>
                            ))}
                        </div>
                    </>
                );
            case 'food':
                return (
                    <>
                        <h4>Diet</h4>
                        <div className={styles.filterSection}>
                            {['Vegan', 'Vegetarian', 'No Pork', 'Halal'].map(opt => (
                                <button className={styles.filterChip} key={opt}>{opt}</button>
                            ))}
                        </div>
                        <h4>Ingredients</h4>
                        <div className={styles.filterSection}>
                            {['Beef', 'Pork', 'Chicken', 'Seafood', 'Dairy', 'Egg'].map(opt => (
                                <button className={styles.filterChip} key={opt}>{opt}</button>
                            ))}
                        </div>
                    </>
                );
            case 'event':
                return (
                    <>
                        <h4>Date</h4>
                        <div className={styles.filterSection}>
                            {['Today', 'This Weekend', 'Select Date'].map(opt => (
                                <button className={styles.filterChip} key={opt}>{opt}</button>
                            ))}
                        </div>
                        <h4>Type</h4>
                        <div className={styles.filterSection}>
                            {['Concert', 'Show', 'Popup', 'Club', 'Exhibition'].map(opt => (
                                <button className={styles.filterChip} key={opt}>{opt}</button>
                            ))}
                        </div>
                    </>
                );
            default:
                return <p>No specific filters for this category.</p>;
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.bottomSheet} slide-up`} onClick={e => e.stopPropagation()}>
                <div className={styles.sheetHeader}>
                    <button onClick={() => setSelectedFilters({})} className={styles.resetBtn}>Reset</button>
                    <h3>Filters</h3>
                    <button onClick={() => { onApply(selectedFilters); onClose(); }} className={styles.applyBtn}>Apply</button>
                </div>
                <div className={styles.sheetContent}>
                    {renderFilters()}
                </div>
            </div>
        </div>
    );
}
