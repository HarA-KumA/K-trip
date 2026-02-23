"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id; // Service ID

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: Date/Time, 2: Confirm

    // Mock Service Data (Ideally fetched by ID)
    const service = {
        title: "Jenny House Cheongdam",
        desc: "Premium K-Pop Idol Hair & Makeup Styling",
        price: "150,000",
        duration: "90 min",
        imageColor: "#ffccd5"
    };

    const timeSlots = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

    // Simple Next 7 Days Generator
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate()
        };
    });

    const handleConfirm = () => {
        // Mock API call
        // router.push('/'); 
        router.push('/my?booked=true');
        // alert("Booking Requested! (Mock)"); // Removing alert for smoother transitions
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header Image */}
            <div className="relative h-64 w-full bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => router.back()} className="glass-btn">← Back</button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="text-xs text-purple-400 font-bold uppercase mb-1">Beauty • Hair</div>
                    <h1 className="text-2xl font-bold">{service.title}</h1>
                    <p className="text-gray-300 text-sm mt-1">{service.desc}</p>
                </div>
            </div>

            <div className="p-6">
                {/* Step 1: Select Date */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4">Select Date</h2>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {dates.map((d) => (
                            <div
                                key={d.full}
                                onClick={() => setSelectedDate(d.full)}
                                className={`flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-2xl border transition-all cursor-pointer ${selectedDate === d.full
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-xs">{d.day}</span>
                                <span className="text-xl font-bold">{d.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 2: Select Time */}
                {selectedDate && (
                    <div className="mb-8 animate-slide-up">
                        <h2 className="text-lg font-bold mb-4">Select Time</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${selectedTime === time
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent border-gray-700 text-gray-300 hover:border-gray-500'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 flex justify-between items-center z-50">
                <div>
                    <div className="text-xs text-gray-400">Total Price</div>
                    <div className="text-lg font-bold text-white">₩{service.price}</div>
                </div>
                <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleConfirm}
                    className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
                >
                    Request Booking
                </button>
            </div>
        </div>
    );
}
