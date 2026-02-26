"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
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
        <div className={styles.container}>
            {/* Background Orbs */}
            <div className={`${styles.orb} ${styles.orbTop}`} />
            <div className={`${styles.orb} ${styles.orbBottom}`} />

            <div className={styles.formCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subTitle}>Sign in to access your K-Trip OS</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className={styles.footer} style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                    Don't have an account?{" "}
                    <span
                        onClick={() => router.push('/auth/signup')}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Sign up
                    </span>
                </div>
            </div>
        </div>
    );
}
