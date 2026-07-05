"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser } from '../UserContext';
import AppUnavailable from '../components/AppUnavailable';

function parseAdminSettings(settings: string | undefined) {
  if (!settings) return null;
  try { return JSON.parse(settings); } catch { return null; }
}

export default function ContactPage() {
  const { isValidApp, isValidatingApp, appAdmin } = useUser();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const contactInfo = useMemo(() => {
    const settings = parseAdminSettings(appAdmin?.adminSettings);
    return {
      whatsapp: settings?.whatsapp || '+1 (210) 728-9032',
      whatsappLink: `https://wa.me/${(settings?.whatsapp || '12107289032').replace(/\D/g, '')}?text=${encodeURIComponent("Hi, I'm interested in tickets")}`,
      telegram: settings?.telegramHandle || '@officialticketescrow',
      telegramLink: `https://t.me/${(settings?.telegramHandle || 'officialticketescrow').replace(/^@/, '')}`,
    };
  }, [appAdmin]);

  useEffect(() => {
    if (token && !isValidApp && !isValidatingApp) return;
  }, [token, isValidApp, isValidatingApp]);

  if (token) {
    if (isValidatingApp) {
      return (
        <div className="min-h-full flex flex-col antialiased bg-white">
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900"></div>
          </main>
        </div>
      );
    }
    if (!isValidApp) return <AppUnavailable />;
  }

  return (
    <div className="min-h-full flex flex-col antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={token ? `/?token=${token}` : '/'} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">TicketsEscrow</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href={token ? `/events?token=${token}` : '/events'} className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Events</Link>
              <Link href={token ? `/contact?token=${token}` : '/contact'} className="px-3.5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg transition-colors">Contact Us</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Contact Us</h1>
            <p className="text-slate-500 max-w-xl">All ticket enquiries and purchases are handled directly through WhatsApp or Telegram. Message us and we&apos;ll respond as soon as possible.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <a href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.123 1.522 5.855L.057 23.704a.75.75 0 0 0 .92.92l5.849-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.498-5.26-1.448l-.376-.225-3.9.976.993-3.9-.24-.39A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <h2 className="font-bold text-slate-900 mb-1">WhatsApp</h2>
              <p className="text-sm text-slate-500 mb-4">Fastest way to reach us. Tap to open a chat directly.</p>
              <p className="text-sm font-semibold text-slate-900">{contactInfo.whatsapp}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Open WhatsApp
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>

            <a href={contactInfo.telegramLink} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#229ED9]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                </svg>
              </div>
              <h2 className="font-bold text-slate-900 mb-1">Telegram</h2>
              <p className="text-sm text-slate-500 mb-4">Prefer Telegram? Message us there &mdash; same team, same service.</p>
              <p className="text-sm font-semibold text-slate-900">{contactInfo.telegram}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Open Telegram
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-bold text-slate-900 mb-4">When you message us, include:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                The event you&apos;re interested in (or send the link from our site)
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                How many tickets you need
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                Your preferred section or budget
              </li>
            </ul>
            <p className="text-xs text-slate-400 mt-5">No payments are processed on this website. All transactions are arranged directly through WhatsApp or Telegram.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-sm">TicketsEscrow</span>
            </div>
            <p className="text-slate-500 text-sm text-center">Browse listings and contact us directly. No payments processed on-site.</p>
            <nav className="flex items-center gap-5 text-sm">
              <Link href={token ? `/events?token=${token}` : '/events'} className="text-slate-500 hover:text-slate-900 transition-colors">Events</Link>
              <Link href={token ? `/contact?token=${token}` : '/contact'} className="text-slate-500 hover:text-slate-900 transition-colors">Contact Us</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              &copy; 2026 TicketsEscrow. All rights reserved.
              <span className="text-slate-300">&middot;</span>
              <Link href={token ? `/admin?token=${token}` : '/admin'} className="hover:text-slate-600 transition-colors">Admin</Link>
            </span>
            <div className="flex items-center gap-4">
              <a href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">WhatsApp: {contactInfo.whatsapp}</a>
              <a href={contactInfo.telegramLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Telegram: {contactInfo.telegram}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
