"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useUser } from '../UserContext';
import { Ticket } from '../types';
import AppUnavailable from '../components/AppUnavailable';

export default function EventDetailsPage() {
  const searchParams = useSearchParams();
  const { tickets, fetchAllTickets, isValidApp, isValidatingApp, defaultAdminSettings, publicAccessToken } = useUser();
  const token = publicAccessToken;

  const eventName = searchParams.get('name') || '';
  const dateTime = searchParams.get('date') || '';

  useEffect(() => {
    if (!token) fetchAllTickets();
  }, [fetchAllTickets, token]);

  const eventListings = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return tickets.filter(ticket => {
      const isNotDeleted = !ticket.deletedSTAMP || ticket.deletedSTAMP.trim() === "";
      const matchesEvent = ticket.eventName.trim().toLowerCase() === eventName.trim().toLowerCase() && ticket.dateTime === dateTime;
      const isNotHidden = ticket.ticketStatus?.toUpperCase() !== "HIDDEN";
      const hasListingDetails = ticket.section && ticket.paymentSettings;
      const isActive = ticket.ticketStatus?.toUpperCase() === 'ACTIVE';
      const isEscrow = (ticket.platform || '').toLowerCase().split(',').map(p => p.trim()).includes('escrow');
      return isNotDeleted && matchesEvent && isNotHidden && hasListingDetails && isActive && isEscrow;
    });
  }, [tickets, eventName, dateTime]);

  const eventInfo = useMemo(() => {
    if (!Array.isArray(tickets)) return null;
    const match = tickets.find(ticket => {
      const isNotDeleted = !ticket.deletedSTAMP || ticket.deletedSTAMP.trim() === "";
      const isActive = ticket.ticketStatus?.toUpperCase() === 'ACTIVE';
      const isEscrow = (ticket.platform || '').toLowerCase().split(',').map(p => p.trim()).includes('escrow');
      return isNotDeleted && isActive && isEscrow && ticket.eventName.trim().toLowerCase() === eventName.trim().toLowerCase() && ticket.dateTime === dateTime;
    });
    return match || null;
  }, [tickets, eventName, dateTime]);

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      const month = d.toLocaleDateString('en-US', { month: 'long' });
      const day = d.getDate();
      const year = d.getFullYear();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${weekday}, ${month} ${day}, ${year} at ${time}`;
    } catch { return dateStr; }
  };

  const getCurrencySymbol = (code?: string) => {
    const symbols: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', NGN: '₦' };
    return symbols[code?.toUpperCase() || 'USD'] || code || '$';
  };

  const t = (url: string) => token ? `${url}?token=${token}` : url;

  const vsMatch = eventName.match(/(.+?)\s+vs\s+(.+)/i);

  const people = [
    { name: 'Lucas H.', location: 'Berlin, Germany' },
    { name: 'Emma R.', location: 'London, UK' },
    { name: 'James K.', location: 'New York, USA' },
    { name: 'Sofia M.', location: 'Madrid, Spain' },
    { name: 'Noah P.', location: 'Sydney, Australia' },
    { name: 'Olivia T.', location: 'Paris, France' },
    { name: 'Liam W.', location: 'Toronto, Canada' },
    { name: 'Mia C.', location: 'Tokyo, Japan' },
    { name: 'Ethan S.', location: 'Mumbai, India' },
    { name: 'Isabella A.', location: 'São Paulo, Brazil' },
    { name: 'Benjamin L.', location: 'Amsterdam, Netherlands' },
    { name: 'Charlotte G.', location: 'Stockholm, Sweden' },
    { name: 'Oliver D.', location: 'Dubai, UAE' },
    { name: 'Amelia F.', location: 'Rome, Italy' },
    { name: 'Henry J.', location: 'Singapore' },
  ];
  const ticketTypes = ['General Admission', 'VIP', 'Standard', 'Hospitality', 'Premium'];
  const quantities = ['2', '3', '4', '5', '6'];

  const otherEventNames = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    const names = new Set<string>();
    tickets.forEach(t => {
      if (t.deletedSTAMP?.trim()) return;
      const pList = (t.platform || '').toLowerCase().split(',').map(p => p.trim());
      if (!pList.includes('escrow')) return;
      if (t.ticketStatus?.toUpperCase() !== 'ACTIVE') return;
      const en = t.eventName.trim();
      if (en.toLowerCase() !== eventName.trim().toLowerCase()) {
        names.add(en);
      }
    });
    return Array.from(names);
  }, [tickets, eventName]);

  const dummyNotifications = useMemo(() => {
    if (!otherEventNames.length) return [];
    const items: Array<{ name: string; location: string; qty: string; ticketType: string; eventName: string; personIdx: number }> = [];
    for (let i = 0; i < 20; i++) {
      const personIdx = i % people.length;
      const p = people[personIdx];
      items.push({
        name: p.name,
        location: p.location,
        personIdx,
        qty: quantities[Math.floor(Math.random() * quantities.length)],
        ticketType: ticketTypes[Math.floor(Math.random() * ticketTypes.length)],
        eventName: otherEventNames[Math.floor(Math.random() * otherEventNames.length)],
      });
    }
    return items;
  }, [otherEventNames]);

  const [notifIdx, setNotifIdx] = useState(0);
  const [notifVisible, setNotifVisible] = useState(false);

  useEffect(() => {
    if (!dummyNotifications.length) return;
    const show = setTimeout(() => setNotifVisible(true), 3000);
    const cycle = setInterval(() => {
      setNotifVisible(false);
      setTimeout(() => {
        setNotifIdx(prev => (prev + 1) % dummyNotifications.length);
        setNotifVisible(true);
      }, 2000);
    }, 7000);
    return () => { clearTimeout(show); clearInterval(cycle); };
  }, [dummyNotifications.length]);

  const reviews = [
    { initial: 'T', name: 'Tyler B.', location: 'Houston, USA', date: 'May 2025', text: 'Bought 2 tickets for the World Cup through here. The process was smooth — messaged on WhatsApp, sent payment, got the tickets same day. Highly recommend.' },
    { initial: 'C', name: 'Claire D.', location: 'Paris, France', date: 'April 2025', text: 'Was skeptical at first but the team was very professional. They verified the tickets before I paid and kept me updated throughout. Will definitely use again for the World Cup.' },
    { initial: 'M', name: 'Marcus T.', location: 'London, UK', date: 'May 2025', text: 'Got VIP hospitality seats for the Champions League final. Prices were fair and everything was exactly as described. Smooth transaction from start to finish.' },
    { initial: 'L', name: 'Lena K.', location: 'Munich, Germany', date: 'March 2025', text: 'Used the Telegram channel to buy 4 tickets. Very fast responses, transparent about everything. Tickets arrived well before the event. 10/10.' },
    { initial: 'S', name: 'Sofia M.', location: 'Madrid, Spain', date: 'April 2025', text: 'Secured tickets for three different matches for my family. Great communication and the prices beat everything I found elsewhere. We\'re already planning to get WC2026 tickets.' },
    { initial: 'R', name: 'Ryan W.', location: 'Los Angeles, USA', date: 'May 2025', text: 'First time using a ticket reseller and I was nervous. The team walked me through every step. Genuine tickets, great seats, zero stress. This is the only place I will use from now on.' },
  ];

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
            <Link href={t('/')} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">TicketsEscrow</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href={t('/events')} className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Events</Link>
              <Link href={t('/contact')} className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Contact Us</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero with cover image */}
        <section className="border-b border-slate-200 bg-white">
          <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden">
            {eventInfo?.coverImage ? (
              <Image
                src={eventInfo.coverImage}
                alt={eventName}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {eventInfo?.category && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700">
                  {eventInfo.category}
                </span>
              )}
              {eventInfo?.subcategory && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg">
                  {eventInfo.subcategory}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                {vsMatch ? vsMatch[1].trim() : eventName}
              </h1>
              {vsMatch && (
                <>
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-slate-100 items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-500">VS</span>
                  </div>
                  <span className="sm:hidden text-xl font-bold text-slate-400">vs</span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {vsMatch[2].trim()}
                  </h1>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>{formatFullDate(dateTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 21c-4-4-7-7.5-7-10.5a7 7 0 1 1 14 0c0 3-3 6.5-7 10.5z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{eventInfo?.venue || 'TBA'}, {eventInfo?.location || 'TBA'}</span>
              </div>
              {eventInfo?.subcategory && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16M8 22v-3a4 4 0 0 1 4-4v0a4 4 0 0 1 4 4v3" />
                    <path d="M6 4v5a6 6 0 0 0 12 0V4H6z" />
                  </svg>
                  <span>{[eventInfo.tournament, eventInfo.subcategory].filter(Boolean).join(' · ')}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Ticket listings or sold out state */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {eventListings.length > 0 ? (
            <div>
              {/* Heading */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Available Tickets</h2>
                  <p className="text-slate-500 text-sm mt-0.5">{eventListings.length} listing{eventListings.length !== 1 ? 's' : ''} available</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <a
                    href={(() => { const s = defaultAdminSettings; return `https://wa.me/${(s?.whatsapp || '12107289032').replace(/\D/g, '')}?text=${encodeURIComponent("Hi%2C%20I'm%20interested%20in%20tickets")}`; })()}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-sm shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.123 1.522 5.855L.057 23.704a.75.75 0 0 0 .92.92l5.849-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.498-5.26-1.448l-.376-.225-3.9.976.993-3.9-.24-.39A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={(() => { const s = defaultAdminSettings; return `https://t.me/${(s?.telegramHandle || 'officialticketescrow').replace(/^@/, '')}`; })()}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-700 border border-slate-200 hover:border-[#229ED9]/50 hover:bg-slate-50 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                    </svg>
                    Telegram
                  </a>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price / Ticket</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eventListings.map((listing, index) => {
                      const price = listing.paymentSettings?.trim();
                      const isContactPrice = !price || price === '0' || price === '$0' || price.toLowerCase() === 'n/a';
                      return (
                        <tr key={index} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {listing.section}{listing.row ? ` / Row ${listing.row}` : ''}
                          </td>
                          <td className="px-5 py-4">
                            {isContactPrice ? (
                              <span className="text-slate-500 text-sm">—</span>
                            ) : (
                              <>
                                <span className="font-bold text-slate-900">{getCurrencySymbol(listing.currency)}{price}</span>
                                <span className="text-slate-400 text-xs ml-1">{listing.currency || 'USD'}</span>
                              </>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {isContactPrice ? (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Contact for Price</span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Available</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs max-w-xs truncate">{listing.description || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3 pb-24">
                {eventListings.map((listing, index) => {
                  const price = listing.paymentSettings?.trim();
                  const isContactPrice = !price || price === '0' || price === '$0' || price.toLowerCase() === 'n/a';
                  return (
                    <div key={index} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{listing.section}{listing.row ? ` / Row ${listing.row}` : ''}</span>
                        <span className="font-bold text-lg text-slate-900">
                          {isContactPrice ? '' : `${getCurrencySymbol(listing.currency)}${price}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        {isContactPrice ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Contact for Price</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Available</span>
                        )}
                        {listing.description && <span className="text-xs text-slate-400 truncate max-w-[60%]">{listing.description}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile fixed bottom CTA bar */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200 backdrop-blur-sm z-40">
                <div className="flex gap-3">
                  <a
                    href={(() => { const s = defaultAdminSettings; return `https://wa.me/${(s?.whatsapp || '12107289032').replace(/\D/g, '')}?text=${encodeURIComponent("Hi%2C%20I'm%20interested%20in%20tickets")}`; })()}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.123 1.522 5.855L.057 23.704a.75.75 0 0 0 .92.92l5.849-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.498-5.26-1.448l-.376-.225-3.9.976.993-3.9-.24-.39A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={(() => { const s = defaultAdminSettings; return `https://t.me/${(s?.telegramHandle || 'officialticketescrow').replace(/^@/, '')}`; })()}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-slate-700 border border-slate-200 bg-white hover:border-[#229ED9]/50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                    </svg>
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Sold Out</h2>
              <p className="text-slate-500 mb-6">All tickets for this event have been sold.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href={(() => { const s = defaultAdminSettings; return `https://wa.me/${(s?.whatsapp || '12107289032').replace(/\D/g, '')}?text=${encodeURIComponent("Hi%2C%20I'm%20interested%20in%20tickets")}`; })()}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-sm shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.123 1.522 5.855L.057 23.704a.75.75 0 0 0 .92.92l5.849-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.498-5.26-1.448l-.376-.225-3.9.976.993-3.9-.24-.39A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp Waitlist
                </a>
                <a
                  href={(() => { const s = defaultAdminSettings; return `https://t.me/${(s?.telegramHandle || 'officialticketescrow').replace(/^@/, '')}`; })()}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-700 border border-slate-200 hover:border-[#229ED9]/50 hover:bg-slate-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 text-[#229ED9] fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                  </svg>
                  Telegram Waitlist
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.172c.97 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.955 2.8c-.785.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.054 9.393c-.783-.57-.381-1.81.588-1.81h4.172a1 1 0 00.95-.69L9.049 2.927z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">5.0</span>
              <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-8">Verified buyers who purchased tickets through our platform</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-slate-600">{r.initial}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.location}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 mt-0.5">{r.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.172c.97 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.955 2.8c-.785.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.054 9.393c-.783-.57-.381-1.81.588-1.81h4.172a1 1 0 00.95-.69L9.049 2.927z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {dummyNotifications.length > 0 && (() => {
        const n = dummyNotifications[notifIdx];
        return (
          <div
            className={`fixed bottom-20 sm:bottom-6 right-4 z-50 w-80 transition-all duration-500 ${
              notifVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-tight">{n.name} from {n.location}</p>
                <p className="text-sm text-slate-500 mt-1 leading-snug">
                  Just purchased <span className="font-semibold text-slate-700">{n.qty} {n.ticketType}</span> tickets for{' '}
                  <span className="font-semibold text-slate-800">{n.eventName}</span>
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1.5">Just now</p>
              </div>
              <button
                onClick={() => setNotifVisible(false)}
                className="text-slate-300 hover:text-slate-500 shrink-0 leading-none text-xl mt-0.5"
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
          </div>
        );
      })()}

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
              <Link href={t('/events')} className="text-slate-500 hover:text-slate-900 transition-colors">Events</Link>
              <Link href={t('/contact')} className="text-slate-500 hover:text-slate-900 transition-colors">Contact Us</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              &copy; 2026 TicketsEscrow. All rights reserved.
              <span className="text-slate-300">&middot;</span>
              <Link href={t('/admin')} className="hover:text-slate-600 transition-colors">Admin</Link>
            </span>
            <div className="flex items-center gap-4">
              <a href={(() => { const s = defaultAdminSettings; return `https://wa.me/${(s?.whatsapp || '12107289032').replace(/\D/g, '')}?text=${encodeURIComponent("Hi%2C%20I'm%20interested%20in%20tickets")}`; })()} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">WhatsApp: {(defaultAdminSettings?.whatsapp || '+1 (210) 728-9032')}</a>
              <a href={(() => { const s = defaultAdminSettings; return `https://t.me/${(s?.telegramHandle || 'officialticketescrow').replace(/^@/, '')}`; })()} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Telegram: {(defaultAdminSettings?.telegramHandle || '@officialticketescrow')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
