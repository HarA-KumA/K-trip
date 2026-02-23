import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import GlobalLangButton from "./components/GlobalLangButton";
import KRideGlobalFAB from "./components/KRideGlobalFAB";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-TRIP | Korea Travel OS",
  description: "Operating your Korea trip with AI. Not just searching.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { TripProvider } from "@/lib/contexts/TripContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TripProvider>
          <div className="mobile-wrapper">
            {children}
            <BottomNav />
            <GlobalLangButton />
            <KRideGlobalFAB />
          </div>
        </TripProvider>
      </body>
    </html>
  );
}
