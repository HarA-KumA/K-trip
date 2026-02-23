"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./BottomNav.module.css";
import { useEffect, useState } from "react";

const navItems = [
    { path: "/", icon: "✦", label: "Home", activeKey: "/" },
    { path: "/explore", icon: "🔍", label: "탐색", activeKey: "/explore" },
    { path: "/planner", icon: "📋", label: "일정", activeKey: "/planner" },
    { path: "/navigation", icon: "📍", label: "오늘", activeKey: "/navigation" },
    { path: "/my", icon: "👤", label: "My", activeKey: "/my" },
];

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("/");

    useEffect(() => {
        const matched = navItems.find(item => {
            if (item.activeKey === "/") return pathname === "/";
            return pathname.startsWith(item.activeKey);
        });
        setActiveTab(matched?.activeKey ?? "");
    }, [pathname]);

    // auth 페이지 및 lang-test에서는 숨김
    if (pathname.startsWith("/auth") || pathname.startsWith("/lang-test")) return null;

    return (
        <nav className={styles.navBar}>
            {navItems.map((item) => {
                const isActive = activeTab === item.activeKey;
                return (
                    <div
                        key={item.label}
                        className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                        onClick={() => router.push(item.path)}
                    >
                        {isActive && <div className={styles.indicator} />}
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </div>
                );
            })}
        </nav>
    );
}
