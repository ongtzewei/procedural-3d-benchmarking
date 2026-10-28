import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Procedural 3D Benchmark',
  description:
    'A side-by-side benchmark of how frontier AI coding models handle procedural 3D generation. The same prompt given to four models, each building an interactive scene from scratch with React Three Fiber and Three.js.',
};

import { TabNav } from '@/app/components/TabNav';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TabNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
