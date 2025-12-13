import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/lib/redux/StoreProvider';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#e24965',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Gestion de Spa - Massothérapie & Esthétique',
  description: 'Application de gestion des dossiers clients pour spa, massothérapie et soins esthétiques',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spa Management',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Gestion de Spa',
    title: 'Gestion de Spa - Massothérapie & Esthétique',
    description: 'Application de gestion des dossiers clients pour spa',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
