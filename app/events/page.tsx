"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useUser } from '../UserContext';
import { Ticket } from '../types';
import AppUnavailable from '../components/AppUnavailable';

function getCurrencySymbol(code?: string) {
  const symbols: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', NGN: '₦' };
  return symbols[code?.toUpperCase() || 'USD'] || code || '$';
}

function getMinPrice(listings: Ticket[]) {
  if (!listings.length) return null;
  let min = Infinity;
  let currency = 'USD';
  listings.forEach(l => {
    const p = parseFloat(l.paymentSettings || '0');
    if (p < min) { min = p; currency = l.currency || 'USD'; }
  });
  return isFinite(min) ? { price: min, currency } : null;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  } catch { return dateStr; }
}

export default function EventsPage() {
  const { tickets, loading, fetchAllTickets, isValidApp, isValidatingApp } = useUser();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const t = (url: string) => token ? `${url}?token=${token}` : url;
  const [selectedCategory, setSelectedCategory] = useState('All Events');

  useEffect(() => {
    if (!token) fetchAllTickets();
  }, [fetchAllTickets, token]);

  const groupedEvents = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    const groups: Record<string, {
      eventName: string; dateTime: string; venue: string; location: string;
      category: string; coverImage: string; listings: Ticket[];
    }> = {};

    tickets.forEach(t => {
      if (t.deletedSTAMP?.trim()) return;
      const key = `${t.eventName.trim().toLowerCase()}_${t.dateTime}`;
      if (!groups[key]) {
        groups[key] = {
          eventName: t.eventName, dateTime: t.dateTime,
          venue: t.venue || 'TBA', location: t.location || 'TBA',
          category: t.category || 'Event', coverImage: t.coverImage || '',
          listings: [],
        };
      }
      if (t.section && t.paymentSettings) groups[key].listings.push(t);
    });
    return Object.values(groups);
  }, [tickets]);

  // Only show events that have at least one active listing
  const availableEvents = useMemo(() =>
    groupedEvents.filter(e => e.listings.length > 0),
    [groupedEvents]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    availableEvents.forEach(e => { if (e.category) cats.add(e.category); });
    return ['All Events', ...Array.from(cats).sort()];
  }, [availableEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All Events') return availableEvents;
    return availableEvents.filter(e => e.category === selectedCategory);
  }, [availableEvents, selectedCategory]);

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
              <Link href={t('/events')} className="px-3.5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg transition-colors">Events</Link>
              <Link href={t('/contact')} className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Contact Us</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Page title */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">Events</h1>
            <p className="text-slate-500 text-sm">{availableEvents.length} event{availableEvents.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>

        {/* Sticky category filter */}
        <div className="border-b border-slate-200 bg-white sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
              {categories.map(cat => {
                const isActive = cat === selectedCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEvents.map((event) => {
                const minPrice = getMinPrice(event.listings);
                const isSoldOut = !minPrice;
                const eventSlug = token
                  ? `/event-details?name=${encodeURIComponent(event.eventName)}&date=${encodeURIComponent(event.dateTime)}&token=${token}`
                  : `/event-details?name=${encodeURIComponent(event.eventName)}&date=${encodeURIComponent(event.dateTime)}`;

                return (
                  <Link
                    key={`${event.eventName}_${event.dateTime}`}
                    href={eventSlug}
                    className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="relative h-44 bg-slate-100">
                      {event.coverImage ? (
                        <Image
                          src={event.coverImage}
                          alt={event.eventName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700">
                          {event.category || 'Event'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-2">{event.eventName}</h3>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          <span>{formatDate(event.dateTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 21c-4-4-7-7.5-7-10.5a7 7 0 1 1 14 0c0 3-3 6.5-7 10.5z" />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                          <span className="truncate">{event.venue}, {event.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        {isSoldOut ? (
                          <span className="text-sm text-red-500 font-medium">Sold Out</span>
                        ) : (
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">From</p>
                            <p className="text-lg font-bold text-slate-900">
                              {getCurrencySymbol(minPrice!.currency)}{minPrice!.price}
                            </p>
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          View Tickets
                          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-sm text-slate-400 font-medium">
                {selectedCategory !== 'All Events' ? 'No events in this category.' : 'No events available yet. Check back soon.'}
              </p>
            </div>
          )}
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
              <a href="https://wa.me/12107289032?text=Hi%2C%20I'm%20interested%20in%20tickets" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">WhatsApp: +1 (210) 728-9032</a>
              <a href="https://t.me/officialticketescrow" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Telegram: @officialticketescrow</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
