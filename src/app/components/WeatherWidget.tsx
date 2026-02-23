"use client";

import { useState, useEffect } from 'react';

export default function WeatherWidget() {
    const [weatherData, setWeatherData] = useState<{ temp: number; icon: string } | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        // Get current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Fetch weather data
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.current_weather) {
                            const code = data.current_weather.weathercode;
                            let icon = '🌤️'; // Default

                            if (code === 0) icon = '☀️'; // Clear
                            else if (code >= 1 && code <= 3) icon = '⛅'; // Partly cloudy
                            else if (code >= 45 && code <= 48) icon = '🌫️'; // Fog
                            else if (code >= 51 && code <= 67) icon = '🌧️'; // Rain
                            else if (code >= 71 && code <= 77) icon = '❄️'; // Snow
                            else if (code >= 80 && code <= 82) icon = '🌦️'; // Showers
                            else if (code >= 95) icon = '⛈️'; // Thunderstorm

                            setWeatherData({
                                temp: Math.round(data.current_weather.temperature),
                                icon: icon
                            });
                        }
                    })
                    .catch((err) => console.error("Failed to fetch weather", err));
            },
            (error) => {
                console.error("Error getting location", error);
            }
        );
    }, []);

    if (!weatherData) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '12px',
            backdropFilter: 'blur(4px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <span>{weatherData.icon}</span>
            <span style={{ fontWeight: 600 }}>{weatherData.temp}°C</span>
        </div>
    );
}
