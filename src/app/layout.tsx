'use client';

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { usePathname } from 'next/navigation';

// export const metadata: Metadata = {
//   title: "AI 배너",
//   description: "AI 배너 광고 관리 시스템",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="ko">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=KBLZ+Han+Maeum+Gothic:wght@300;400;500;700&display=swap" 
          rel="stylesheet" 
        />
        <title>AI 배너 광고 관리 시스템</title>
        <meta name="description" content="AI 배너 광고 관리 시스템" />
      </head>
      <body className="antialiased">
        {pathname !== '/login' && <Navbar />}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
