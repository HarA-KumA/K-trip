'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// This page handles the OAuth redirect from Google back into the app.
// Supabase exchanges the code for a session automatically.
export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Get the session that Supabase set from the URL fragment/code
            const { data } = await supabase.auth.getSession();

            if (data?.session?.user) {
                const user = data.session.user;
                const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
                // Sync to localStorage for backward compat with existing UI components
                localStorage.setItem('user', JSON.stringify({ name, email: user.email }));
            }

            // Redirect to home regardless
            router.replace('/');
        };

        handleCallback();
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--background)',
        }}>
            <div style={{
                width: '40px', height: '40px',
                border: '3px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem' }}>Signing you in...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
