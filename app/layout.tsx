import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import RootLayoutWrapper from './RootLayout';
import { Inter } from 'next/font/google';

import { UserProvider } from './UserContext';
import ManifestLoader from './ManifestLoader';
import RegisterSW from './RegisterSW';
import PwaInstallPrompt from './PwaInstallPrompt';
import HideSplash from './HideSplash';

config.autoAddCss = false;
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Tickets Escrow — Event Ticket Marketplace',
  description: 'Browse verified ticket listings for sports, concerts and live events. Contact us directly via WhatsApp or Telegram.',
  keywords: 'tickets, events, sports, concerts, football, ticket marketplace, escrow',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    url: 'https://tickets-escrow.vercel.app/',
    title: 'Tickets Escrow — Event Ticket Marketplace',
    description: 'Browse verified ticket listings for sports, concerts and live events. Contact us directly via WhatsApp or Telegram.',
    siteName: 'TicketsEscrow',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TicketsEscrow" />
        <link rel="apple-touch-startup-image" href="/splash-1024x1024.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <style>{`
          html { background: #0f172a; }
          body {
            padding-bottom: env(safe-area-inset-bottom);
            overscroll-behavior: none;
          }
          #splash-screen {
            position: fixed; inset: 0; z-index: 99999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 16px;
            background: #0f172a;
            opacity: 1; transition: opacity 0.3s ease-out;
            pointer-events: none;
          }
          #splash-screen.hidden { opacity: 0; }
          #splash-screen .splash-icon {
            width: 64px; height: 64px; border-radius: 16px;
            background: rgba(255,255,255,0.1);
            display: flex; align-items: center; justify-content: center;
          }
          #splash-screen .splash-icon svg {
            width: 32px; height: 32px; color: #fff;
          }
          #splash-screen .splash-text {
            font-family: inherit; font-weight: 700; font-size: 20px;
            color: #fff; letter-spacing: -0.02em;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <div id="splash-screen" suppressHydrationWarning>
          <div className="splash-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <span className="splash-text">TicketsEscrow</span>
        </div>
        <HideSplash />
        <UserProvider>
          <PwaInstallPrompt />
          <RootLayoutWrapper inter={inter}>
            {children}
          </RootLayoutWrapper>
        </UserProvider>
        <ManifestLoader />
        <RegisterSW />
      </body>
    </html>
  );
}