'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { ServiceItem } from '../mock/data';

interface ExploreMapProps {
    items: ServiceItem[];
    center: { lat: number; lng: number };
    onItemClick: (id: string) => void;
    radius?: number;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    borderRadius: '12px'
};

const OPTIONS = {
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
};

export default function ExploreMap(props: ExploreMapProps) {
    const [mapLang, setMapLang] = useState<string | null>(null);

    useEffect(() => {
        // Map i18n codes back to valid Google Maps language codes if necessary
        const stored = localStorage.getItem('ktrip_lang') || 'ko';
        const googleMapLanguageMapping: Record<string, string> = {
            'jp': 'ja',
            'cn': 'zh-CN',
            'tw': 'zh-TW',
            'ko': 'ko',
            'en': 'en',
            'th': 'th',
            'vi': 'vi',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'id': 'id',
            'ms': 'ms',
            'ru': 'ru',
            'ar': 'ar',
            'pt': 'pt'
        };
        setMapLang(googleMapLanguageMapping[stored] || 'en');
    }, []);

    if (!mapLang) {
        return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Initializing Map...</div>;
    }

    return <ExploreMapInner {...props} lang={mapLang} />;
}

function ExploreMapInner({ items, center, onItemClick, radius, lang }: ExploreMapProps & { lang: string }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
        language: lang,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const priorityA = 0;
            const priorityB = 0;
            return priorityB - priorityA;
        });
    }, [items]);

    if (!isLoaded) return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>;

    let dynamicZoom = 14;
    if (radius) {
        if (radius <= 500) dynamicZoom = 16;
        else if (radius <= 1000) dynamicZoom = 15;
        else if (radius <= 3000) dynamicZoom = 13;
    }

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '400px', position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={dynamicZoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={OPTIONS}
            >
                <Marker
                    position={center}
                    icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                />

                {sortedItems.map(item => {
                    if (!item.lat || !item.lng) return null;

                    return (
                        <Marker
                            key={item.id}
                            position={{ lat: item.lat, lng: item.lng }}
                            onClick={() => setSelectedItem(item)}
                        />
                    );
                })}

                {selectedItem && selectedItem.lat && selectedItem.lng && (
                    <InfoWindow
                        position={{ lat: selectedItem.lat, lng: selectedItem.lng }}
                        onCloseClick={() => setSelectedItem(null)}
                    >
                        <div
                            style={{ padding: '8px', cursor: 'pointer', maxWidth: '200px' }}
                            onClick={() => onItemClick(selectedItem.id)}
                        >
                            <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 'bold' }}>{selectedItem.title}</h3>
                            <p style={{ margin: '0 0 4px', fontSize: '12px' }}>{selectedItem.area}</p>
                            <span style={{ fontSize: '12px', color: '#0066cc' }}>View Details &rarr;</span>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
