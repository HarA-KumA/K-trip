'use client';

import { useState } from 'react';
import styles from '../explore.module.css';
import { CITIES, CATEGORIES, CityId } from '../mock/data';

interface ExploreHeaderProps {
    currentCity: CityId;
    onCityChange: (cityId: CityId) => void;
    currentCategory: string; // "all" | CategoryId
    onCategoryChange: (catId: string) => void;
    onFilterClick: () => void;
    filterCount: number;
}

export default function ExploreHeader({
    currentCity,
    onCityChange,
    currentCategory,
    onCategoryChange,
    onFilterClick,
    filterCount
}: ExploreHeaderProps) {
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleCitySelect = (cityId: CityId) => {
        onCityChange(cityId);
        setIsCityModalOpen(false);
    };

    const getPlaceholder = () => {
        switch (currentCategory) {
            case 'beauty': return 'Search clinics, salons...';
            case 'event': return 'Search concerts, shows...';
            case 'food': return 'Search restaurants, dishes...';
            case 'festival': return 'Search festivals...';
            case 'attraction': return 'Search palaces, parks...';
            default: return 'Search for beauty, food...';
        }
    };

    return (
        <>
            <header className={styles.stickyHeader}>
                {/* Top Row: City & Title */}
                <div className={styles.headerTop}>
                    <div
                        className={styles.cityPill}
                        onClick={() => setIsCityModalOpen(true)}
                    >
                        {CITIES.find(c => c.id === currentCity)?.label} <span className={styles.dropdownArrow}>▾</span>
                    </div>
                    {/* Optional: Add user profile or other icons here */}
                </div>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder={getPlaceholder()}
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className={styles.filterBtn} onClick={onFilterClick}>
                        <span className={styles.filterIcon}>⚡</span>
                        {filterCount > 0 && <span className={styles.filterBadge}>{filterCount}</span>}
                    </button>
                </div>

                {/* Category Tabs */}
                <div className={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <div
                            key={cat.id}
                            className={`${styles.categoryChip} ${currentCategory === cat.id ? styles.active : ''}`}
                            onClick={() => onCategoryChange(cat.id)}
                        >
                            {cat.label}
                        </div>
                    ))}
                </div>
            </header>

            {/* City Selection Modal */}
            {isCityModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCityModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Select City</h3>
                        <div className={styles.cityGrid}>
                            {CITIES.map(city => (
                                <button
                                    key={city.id}
                                    className={`${styles.cityOption} ${currentCity === city.id ? styles.selected : ''}`}
                                    onClick={() => handleCitySelect(city.id as CityId)}
                                >
                                    {city.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
