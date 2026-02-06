import React from 'react';
import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Hirely AI',
  description: 'High-performance resume audit and optimization platform to help you craft the perfect resume.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

// Fix: Import React to resolve the 'Cannot find namespace React' error when using React.ReactNode
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; worker-src 'none'; object-src 'none';" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />

      </head>
      <body className="bg-slate-50 dark:bg-[#040711] transition-colors duration-300 antialiased selection:bg-violet-500/30">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
