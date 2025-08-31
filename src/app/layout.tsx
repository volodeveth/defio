import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Defio - One-tap DeFi on Base',
  description: 'Social DeFi aggregator for Base network. Swap, lend, and earn directly from your social feed.',
  keywords: ['DeFi', 'Base', 'Farcaster', 'Swap', 'Crypto', 'Web3'],
  authors: [{ name: 'Defio Team' }],
  creator: 'Defio',
  publisher: 'Defio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Defio - One-tap DeFi on Base',
    description: 'Social DeFi aggregator for Base network. Swap, lend, and earn directly from your social feed.',
    siteName: 'Defio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Defio - One-tap DeFi on Base',
    description: 'Social DeFi aggregator for Base network. Swap, lend, and earn directly from your social feed.',
    creator: '@defio_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification tokens here
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/icon.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#0A0B0D" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}