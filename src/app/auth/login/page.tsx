"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // For logo if needed
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // Future integration

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Mock Login for MVP
        setTimeout(() => {
            if (email && password) {
                // Success
                console.log("Logged in mock");
                // Attempt to get name from signup, otherwise use email handle
                const savedName = localStorage.getItem(`signup_name_${email}`);
                const userName = savedName || email.split('@')[0];
                localStorage.setItem('user', JSON.stringify({ name: userName, email }));
                setLoading(false);
                router.push('/');
            } else {
                setError("Please fill in all fields.");
                setLoading(false);
            }
        }, 1000);

        /* Real Integration Code:
        const supabase = createClientComponentClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setError(error.message);
        else router.push('/');
        */
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-gray-900 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-100/20 blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-sm glass-panel p-8 rounded-3xl border border-gray-100 backdrop-blur-xl bg-white/40">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to access your K-Trip OS</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                            style={{ color: '#1e293b', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                            style={{ color: '#1e293b', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account? <span onClick={() => router.push('/auth/signup')} className="text-blue-500 cursor-pointer hover:underline">Sign up</span>
                </div>
            </div>
        </div>
    );
}
