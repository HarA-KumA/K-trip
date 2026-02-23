'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type BookingStatus = 'draft' | 'submitted' | 'in_progress' | 'confirmed' | 'unavailable' | 'canceled';
export type TripMode = 'idle' | 'pre-trip' | 'on-trip' | 'near-deadline';

export interface ItineraryItem {
    id: string;
    name: string;
    time: string;
    status: BookingStatus;
    lat: number;
    lng: number;
    day?: number;
    slot?: 'am' | 'pm' | 'night';
    type?: string;
    image_color?: string;
    badges?: string[];
}

interface TripContextType {
    tripStatus: TripMode;
    itinerary: ItineraryItem[];
    setTripStatus: (status: TripMode) => void;
    addItineraryItem: (item: ItineraryItem) => void;
    removeItineraryItem: (id: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
    const [tripStatus, setTripStatus] = useState<TripMode>('idle');
    const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('trip_itinerary');
        if (saved) {
            setItinerary(JSON.parse(saved));
        } else {
            // Initial mock data
            const mockItinerary: ItineraryItem[] = [
                {
                    id: '1', name: 'Paradise Spa', time: '10:00', status: 'confirmed',
                    lat: 37.5665, lng: 126.9780, day: 1, slot: 'am', type: 'beauty'
                },
                {
                    id: '2', name: 'Hongdae Nail', time: '14:00', status: 'submitted',
                    lat: 37.5565, lng: 126.9230, day: 1, slot: 'pm', type: 'beauty'
                },
            ];
            setItinerary(mockItinerary);
        }
    }, []);

    useEffect(() => {
        if (itinerary.length > 0) {
            localStorage.setItem('trip_itinerary', JSON.stringify(itinerary));
            if (tripStatus === 'idle') setTripStatus('pre-trip');
        }
    }, [itinerary, tripStatus]);

    const addItineraryItem = (item: ItineraryItem) => {
        setItinerary(prev => [...prev, item]);
    };

    const removeItineraryItem = (id: string) => {
        setItinerary(prev => prev.filter(i => i.id !== id));
    };

    return (
        <TripContext.Provider value={{
            tripStatus,
            itinerary,
            setTripStatus,
            addItineraryItem,
            removeItineraryItem
        }}>
            {children}
        </TripContext.Provider>
    );
}

export function useTrip() {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
}
