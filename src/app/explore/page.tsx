'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './explore.module.css';
import { MOCK_ITEMS, ServiceItem, CityId } from './mock/data';
import ExploreHeader from './components/ExploreHeader';
import ServiceCard from './components/ServiceCard';
import FilterSheet from './components/FilterSheet';
import AddToPlanModal from './components/AddToPlanModal';

interface PlanItem { itemId: string; day: number; }
type ActiveFilters = Record<string, string[]>;

export default function ExplorePage() {
    const router = useRouter();

    // -- State --
    const [currentCity, setCurrentCity] = useState<CityId>('seoul');
    const [currentCategory, setCurrentCategory] = useState<string>('all');

    // Local persistence mock
    const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
    const [planItems, setPlanItems] = useState<PlanItem[]>([]); // { itemId, day }

    // UI State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAddToPlanOpen, setIsAddToPlanOpen] = useState(false);
    const [selectedItemForPlan, setSelectedItemForPlan] = useState<ServiceItem | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Filters
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

    // -- Effects --
    useEffect(() => {
        const saved = localStorage.getItem('saved_items');
        if (saved) setSavedItemIds(JSON.parse(saved) as string[]);
        const plan = localStorage.getItem('draft_plan_items');
        if (plan) setPlanItems(JSON.parse(plan) as PlanItem[]);
    }, []);

    // -- Handlers --

    const handleCityChange = (cityId: CityId) => {
        setCurrentCity(cityId);
        showToast(`City changed to ${cityId.toUpperCase()}`);
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
            itemId: selectedItemForPlan.id,
            title: selectedItemForPlan.title,
            day: day,
            addedAt: new Date().toISOString()
        };

        const newPlan = [...planItems, newItem];
        setPlanItems(newPlan);
        localStorage.setItem('draft_plan_items', JSON.stringify(newPlan));

        showToast(`Added to Day ${day}`);
        setIsAddToPlanOpen(false);
        setSelectedItemForPlan(null);
    };

    const handleDetails = (id: string) => {
        router.push(`/explore/${id}`);
    };

    const handleApplyFilter = (filters: ActiveFilters) => {
        setActiveFilters(filters);
        // In a real app, we would process these filters
        // For MVP demo, we just indicate filters are applied
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // -- Filtering Logic --
    const filteredItems = MOCK_ITEMS.filter(item => {
        // 1. City Match
        if (item.city_id !== currentCity) return false;

        // 2. Category Match
        if (currentCategory !== 'all' && item.type !== currentCategory) return false;

        // 3. Search Term (Not implemented in this snippet, managed in Header mostly visual for MVP specific)

        // 4. (Optional) Advanced Filter Logic would go here

        return true;
    });

    return (
        <div className={styles.container}>
            {/* Header */}
            <ExploreHeader
                currentCity={currentCity}
                onCityChange={handleCityChange}
                currentCategory={currentCategory}
                onCategoryChange={handleCategoryChange}
                onFilterClick={() => setIsFilterOpen(true)}
                filterCount={Object.keys(activeFilters).length}
            />

            {/* List Content */}
            <main style={{ paddingBottom: '80px' }}>
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <ServiceCard
                            key={item.id}
                            item={item}
                            onSave={handleSave}
                            onAddToPlan={() => openAddToPlan(item)}
                            onDetails={handleDetails}
                            isSaved={savedItemIds.includes(item.id)}
                        />
                    ))
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                        <p>No items found in {currentCity.toUpperCase()}.</p>
                        <p>Try changing the category or city.</p>
                    </div>
                )}
            </main>

            {/* Modals & Sheets */}

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

            {/* Toast */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 300,
                    animation: 'fadeIn 0.2s'
                }}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
