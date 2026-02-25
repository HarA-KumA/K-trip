'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './explore.module.css';
import { MOCK_ITEMS, ServiceItem, CityId } from './mock/data';
import ExploreHeader from './components/ExploreHeader';
import FilterSheet from './components/FilterSheet';
import AddToPlanModal from './components/AddToPlanModal';
import ExploreMap from './components/ExploreMap';

import { useTrip } from '@/lib/contexts/TripContext';
import { useTranslation } from 'react-i18next';

interface PlanItem { itemId: string; day: number; }
type ActiveFilters = Record<string, string[]>;

export default function ExplorePage() {
    const { t } = useTranslation('common');
    const { addItineraryItem } = useTrip();
    const router = useRouter();

    // -- State --
    const [currentCity, setCurrentCity] = useState<CityId>('seoul');
    const [currentCategory, setCurrentCategory] = useState<string>('all');
    const [hotelLocation, setHotelLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);
    const [radius, setRadius] = useState<number>(1000);
    const [nearbyItems, setNearbyItems] = useState<ServiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Local persistence mock
    const [savedItemIds, setSavedItemIds] = useState<string[]>([]);

    // UI State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAddToPlanOpen, setIsAddToPlanOpen] = useState(false);
    const [selectedItemForPlan, setSelectedItemForPlan] = useState<ServiceItem | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Filters
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
    const [searchTerm, setSearchTerm] = useState("");

    // -- Effects --
    useEffect(() => {
        const saved = localStorage.getItem('saved_items');
        if (saved) setSavedItemIds(JSON.parse(saved) as string[]);

        // Fetch real geolocation on mount
        if (navigator.geolocation && !hotelLocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setHotelLocation({
                        lat: latitude,
                        lng: longitude,
                        name: t('common.current_location', { defaultValue: 'My Location' })
                    });
                },
                (err) => console.log('Location access denied', err)
            );
        }
    }, []);

    useEffect(() => {
        if (hotelLocation) {
            // Delay slightly to debounce fast changes if needed, or straight fetch
            fetchNearby(hotelLocation.lat, hotelLocation.lng, radius, currentCategory);
        }
    }, [hotelLocation, radius, currentCategory]);

    const fetchNearby = async (lat: number, lng: number, r: number, cat: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/places/nearby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, radius: r, category: cat }),
            });
            const data = await res.json();

            // Map Google Places format to ServiceItem format
            const mappedItems: ServiceItem[] = (data.places || []).map((p: any) => ({
                id: p.id,
                title: p.displayName.text,
                area: p.formattedAddress.split(',')[1]?.trim() || p.formattedAddress,
                type: cat as any,
                lat: p.location.latitude,
                lng: p.location.longitude,
                rating: p.rating,
                reviews: p.userRatingCount,
                image_color: '#333', // Default or from photo
                badges: [], // Could map types to badges
                description: p.formattedAddress
            }));

            setNearbyItems(mappedItems);
        } catch (error) {
            console.error('Fetch nearby error:', error);
            showToast('Failed to fetch nearby items');
        } finally {
            setIsLoading(false);
        }
    };

    // -- Handlers --

    const handleHotelSelect = (location: { lat: number, lng: number, name: string, placeId: string }) => {
        setHotelLocation(location);
        showToast(`Base location set to ${location.name}`);
    };

    const handleCityChange = (cityId: CityId) => {
        setCurrentCity(cityId);
        const cityName = t(`common.cities.${cityId}`, { defaultValue: cityId.toUpperCase() });
        showToast(t('explore_page.city_changed', { city: cityName }));
    };

    const handleCategoryChange = (catId: string) => {
        setCurrentCategory(catId);
        setActiveFilters({});
    };

    const handleSave = (id: string) => {
        const newSaved = savedItemIds.includes(id)
            ? savedItemIds.filter(idx => idx !== id)
            : [...savedItemIds, id];

        setSavedItemIds(newSaved);
        localStorage.setItem('saved_items', JSON.stringify(newSaved));
    };

    const openAddToPlan = (item: ServiceItem) => {
        setSelectedItemForPlan(item);
        setIsAddToPlanOpen(true);
    };

    const handleAddToPlan = (day: number) => {
        if (!selectedItemForPlan) return;

        const newItem = {
            id: `plan_${selectedItemForPlan.id}_${Date.now()}`,
            name: selectedItemForPlan.title,
            time: '12:00',
            status: 'draft' as const,
            lat: selectedItemForPlan.lat || 37.5,
            lng: selectedItemForPlan.lng || 127.0,
            day: day,
            slot: 'pm' as const,
            type: selectedItemForPlan.type,
            image_color: selectedItemForPlan.image_color,
            badges: selectedItemForPlan.badges
        };

        addItineraryItem(newItem);

        showToast(t('explore_page.added_to', { day }));
        setIsAddToPlanOpen(false);
        setSelectedItemForPlan(null);
    };

    const handleDetails = (id: string) => {
        router.push(`/explore/${id}`);
    };

    const handleApplyFilter = (filters: ActiveFilters) => {
        setActiveFilters(filters);
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // -- Filtering Logic --
    let baseItems = (hotelLocation && nearbyItems.length > 0) ? nearbyItems : MOCK_ITEMS;

    // Apply category filter
    const categorizedItems = baseItems.filter(item => {
        if (currentCategory !== 'all' && item.type !== currentCategory) return false;
        return true;
    });

    // Apply search term filter
    const itemsToShow = categorizedItems.filter(item => {
        if (!searchTerm) return true;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.area.toLowerCase().includes(lowerCaseSearchTerm);
    });

    // Sort so premium items or future clients come first, then others
    const sortedItemsToShow = [...itemsToShow].sort((a, b) => {
        const aScore = (a as any).is_premium ? 1 : 0;
        const bScore = (b as any).is_premium ? 1 : 0;
        return bScore - aScore;
    });

    return (
        <div className={styles.container}>
            <ExploreHeader
                currentCity={currentCity}
                onCityChange={handleCityChange}
                currentCategory={currentCategory}
                onCategoryChange={handleCategoryChange}
                onFilterClick={() => setIsFilterOpen(true)}
                filterCount={Object.keys(activeFilters).length}
                onHotelSelect={handleHotelSelect}
                radius={radius}
                onRadiusChange={setRadius}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <main style={{ paddingBottom: '80px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', minHeight: '500px' }}>
                {isLoading && (
                    <div className={styles.loadingState} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
                        <div className={styles.spinner}></div>
                        <p>Finding nearby {currentCategory}...</p>
                    </div>
                )}
                <div style={{ flex: 1, width: '100%', display: 'flex' }}>
                    <ExploreMap
                        items={sortedItemsToShow}
                        center={hotelLocation ? { lat: hotelLocation.lat, lng: hotelLocation.lng } : { lat: 37.5665, lng: 126.9780 }} // Default to Seoul City Hall
                        onItemClick={handleDetails}
                        radius={radius}
                    />
                </div>
            </main>

            <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                category={currentCategory}
                onApply={handleApplyFilter}
            />

            <AddToPlanModal
                isOpen={isAddToPlanOpen}
                onClose={() => setIsAddToPlanOpen(false)}
                onSelectDay={handleAddToPlan}
                itemTitle={selectedItemForPlan?.title || ''}
            />

            {toastMessage && (
                <div className={styles.toast}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)}km`;
}

