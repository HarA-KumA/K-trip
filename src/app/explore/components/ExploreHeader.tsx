import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from '../explore.module.css';
import { CITIES, CATEGORIES, CityId } from '../mock/data';
import HotelSearch from './HotelSearch';

interface ExploreHeaderProps {
    currentCity: CityId;
    onCityChange: (cityId: CityId) => void;
    currentCategory: string; // "all" | CategoryId
    onCategoryChange: (catId: string) => void;
    onFilterClick: () => void;
    filterCount: number;
    onHotelSelect: (location: { lat: number, lng: number, name: string, placeId: string }) => void;
    radius: number;
    onRadiusChange: (r: number) => void;
}

export default function ExploreHeader({
    currentCity,
    onCityChange,
    currentCategory,
    onCategoryChange,
    onFilterClick,
    filterCount,
    onHotelSelect,
    radius,
    onRadiusChange
}: ExploreHeaderProps) {
    const { t } = useTranslation('common');
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleCitySelect = (cityId: CityId) => {
        onCityChange(cityId);
        setIsCityModalOpen(false);
    };

    const getPlaceholder = () => {
        const key = `explore_page.search_placeholders.${currentCategory}`;
        return t(key, { defaultValue: 'Search for beauty, food...' });
    };

    return (
        <>
            <header className={styles.stickyHeader}>
                {/* Top Row: Hotel Search */}
                <div className={styles.headerTop}>
                    <HotelSearch onSelect={onHotelSelect} />
                </div>

                {/* Sub Row: Search Bar & Radius / Filter */}
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

                    <div className={styles.headerActions}>
                        {/* Replaced select with scroll menu below */}
                        <button className={styles.filterBtn} onClick={onFilterClick}>
                            <span className={styles.filterIcon}>⚡</span>
                            {filterCount > 0 && <span className={styles.filterBadge}>{filterCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <div
                            key={cat.id}
                            className={`${styles.categoryChip} ${currentCategory === cat.id ? styles.active : ''}`}
                            onClick={() => onCategoryChange(cat.id)}
                        >
                            {t(`common.categories.${cat.id}`, { defaultValue: cat.label })}
                        </div>
                    ))}
                </div>

                {/* Radius Scroll Menu */}
                <div className={styles.categoryScroll} style={{ marginTop: '0', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.chipLabel} style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginRight: '8px', alignSelf: 'center' }}>
                        Distance:
                    </div>
                    {[
                        { label: '500m', value: 500 },
                        { label: '1km', value: 1000 },
                        { label: '3km', value: 3000 }
                    ].map(rad => (
                        <div
                            key={rad.value}
                            className={`${styles.categoryChip} ${radius === rad.value ? styles.active : ''}`}
                            onClick={() => onRadiusChange(rad.value)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                            {rad.label}
                        </div>
                    ))}
                </div>
            </header>

            {/* City Selection Modal - Keep it for now or remove if it's redundant with HotelSearch */}
            {isCityModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCityModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>{t('explore_page.select_city')}</h3>
                        <div className={styles.cityGrid}>
                            {CITIES.map(city => (
                                <button
                                    key={city.id}
                                    className={`${styles.cityOption} ${currentCity === city.id ? styles.selected : ''}`}
                                    onClick={() => handleCitySelect(city.id as CityId)}
                                >
                                    {t(`common.cities.${city.id}`, { defaultValue: city.label })}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
