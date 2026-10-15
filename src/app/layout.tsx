// app/layout.tsx — Root layout with RTL Arabic font + query providers

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "الذهابة — نظام إدارة المجوهرات",
  description: "El Dhehaba — Jewelry POS & Inventory for Algerian Gold Markets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased bg-stone-950 text-stone-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
