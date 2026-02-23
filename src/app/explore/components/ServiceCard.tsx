'use client';

import { ServiceItem } from '../mock/data';
import styles from '../explore.module.css';

interface ServiceCardProps {
    item: ServiceItem;
    onSave: (id: string) => void;
    onAddToPlan: (id: string) => void;
    onDetails: (id: string) => void;
    isSaved: boolean;
}

export default function ServiceCard({ item, onSave, onAddToPlan, onDetails, isSaved }: ServiceCardProps) {

    const renderBadges = () => {
        return (
            <div className={styles.badges}>
                {item.badges.map(badge => (
                    <span key={badge} className={styles.badge}>{badge}</span>
                ))}
                {item.vegan_option && (
                    <span className={`${styles.badge} ${styles.veganBadge}`}>
                        {item.vegan_option === 'all_vegan' ? 'Vegan Only' : 'Vegan Option'}
                    </span>
                )}
            </div>
        );
    };

    const renderTypeSpecificInfo = () => {
        switch (item.type) {
            case 'food':
                return (
                    <div className={styles.foodTags}>
                        {item.ingredients?.map(ing => (
                            <span key={ing} className={styles.ingredientTag}>{ing}</span>
                        ))}
                        {item.diet_tags?.map(diet => (
                            <span key={diet} className={styles.dietTag}>{diet}</span>
                        ))}
                    </div>
                );
            case 'event':
                return (
                    <div className={styles.eventTimeStrip}>
                        Today {item.start_time}
                    </div>
                );
            case 'beauty':
                return (
                    <div className={styles.beautyInfo}>
                        <span>⏱ {item.duration_min} min</span>
                        <span>Starts from ₩{item.price_from?.toLocaleString()}</span>
                    </div>
                );
            case 'festival':
                return (
                    <div className={styles.festivalInfo}>
                        <span>📅 {item.date_range}</span>
                        <span className={item.indoor_outdoor === 'indoor' ? styles.indoor : styles.outdoor}>
                            {item.indoor_outdoor?.toUpperCase()}
                        </span>
                    </div>
                );
            case 'attraction':
                return (
                    <div className={styles.attractionInfo}>
                        <span>⏳ {item.time_needed}</span>
                        <span className={styles.themeBadge}>{item.theme}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.card}>
            {/* Thumbnail */}
            <div
                className={styles.cardThumbnail}
                style={{ backgroundColor: item.image_color || '#eee' }}
                onClick={() => onDetails(item.id)}
            >
                {/* Event specific overlay */}
                {item.type === 'event' && (
                    <div className={styles.eventOverlay}>
                        Tonight {item.start_time}
                    </div>
                )}
                {/* Save Button */}
                <button
                    className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave(item.id);
                    }}
                >
                    {isSaved ? '♥' : '♡'}
                </button>
            </div>

            {/* Content */}
            <div className={styles.cardContent} onClick={() => onDetails(item.id)}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <div className={styles.cardMeta}>
                        <span className={styles.area}>{item.area}</span>
                        <span className={styles.price}>
                            {Array(item.price_level).fill('₩').join('')}
                        </span>
                    </div>
                </div>

                {renderTypeSpecificInfo()}
                {renderBadges()}
            </div>

            {/* Actions */}
            <div className={styles.cardActions}>
                <button
                    className={styles.addToPlanBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlan(item.id);
                    }}
                >
                    + Add to Plan
                </button>
            </div>
        </div>
    );
}
