"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./BottomNav.module.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { homeTab } from "./BottomNav/tabs/home";
import { exploreTab } from "./BottomNav/tabs/explore";
import { itineraryTab } from "./BottomNav/tabs/itinerary";
import { communityTab } from "./BottomNav/tabs/community";
import { helpTab } from "./BottomNav/tabs/help";
import { myTab } from "./BottomNav/tabs/my";

export default function BottomNav() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("/");

    const navItems = [
        homeTab(t),
        exploreTab(t),
        itineraryTab(t),
        communityTab(t),
        helpTab(t),
        myTab(t),
    ];

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
                        key={item.path}
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
