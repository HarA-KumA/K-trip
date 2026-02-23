"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock Signup
        setTimeout(() => {
            router.push('/auth/login');
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-purple-900/30 blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-sm glass-panel p-8 rounded-3xl border border-white/10 backdrop-blur-xl bg-white/5">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join the K-Trip Experience</p>
                </div>

                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account? <span onClick={() => router.push('/auth/login')} className="text-purple-400 cursor-pointer hover:underline">Log in</span>
                </div>
            </div>
        </div>
    );
}
