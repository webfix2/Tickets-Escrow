"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from './UserContext';
import { Ticket } from './types';
import { parseListings, getMinPrice } from './utils/ticketListings';
import Countdown from './components/Countdown';
import AppUnavailable from './components/AppUnavailable';
import PurchaseToast from './components/PurchaseToast';

function getCurrencySymbol(code?: string) {
  const symbols: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', NGN: '₦' };
  return symbols[code?.toUpperCase() || 'USD'] || code || '$';
}

function getMinPriceFromTickets(listings: Ticket[]) {
  if (!listings.length) return null;
  let min = Infinity;
  let currency = 'USD';
  listings.forEach(t => {
    parseListings(t).forEach(l => {
      const p = parseFloat(l.price || '0');
      if (p > 0 && p < min) { min = p; currency = l.currency || 'USD'; }
    });
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

export default function Home() {
  const { tickets, loading, fetchAllTickets, isOffline, isValidApp, isValidatingApp, defaultAdminSettings, publicAccessToken } = useUser();
  const token = publicAccessToken;
  const t = (url: string) => token ? `${url}?token=${token}` : url;

  useEffect(() => {
    if (!token) fetchAllTickets();
  }, [fetchAllTickets, token]);

  const groupedEvents = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    const groups: Record<string, {
      eventName: string; dateTime: string; venue: string; location: string;
      category: string; coverImage: string; ticketStatus: string; listings: Ticket[];
      tournament: string; subcategory: string;
    }> = {};

    tickets.forEach(t => {
      if (t.deletedSTAMP?.trim()) return;
      const pList = (t.platform || '').toLowerCase().split(',').map(p => p.trim());
      if (!pList.includes('escrow')) return;
      if (t.ticketStatus?.toUpperCase() !== 'ACTIVE') return;
      const key = `${t.eventName.trim().toLowerCase()}_${t.dateTime}`;
      if (!groups[key]) {
        groups[key] = {
          eventName: t.eventName, dateTime: t.dateTime,
          venue: t.venue || 'TBA', location: t.location || 'TBA',
          category: t.category || 'Event', coverImage: t.coverImage || '',
          ticketStatus: t.ticketStatus, listings: [],
          tournament: t.tournament || '',
          subcategory: t.subcategory || '',
        };
      }
      if (t.section && t.paymentSettings) {
        groups[key].listings.push(t);
      }
    });
    return Object.values(groups);
  }, [tickets]);

  const featuredEvents = useMemo(() => groupedEvents.slice(0, 8), [groupedEvents]);

  const headerNav = (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={t('/')} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">TicketsEscrow</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href={t('/events')} className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              Events
            </Link>
            <Link href={t('/contact')} className="px-3.5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );

  const contactInfo = useMemo(() => {
    const s = defaultAdminSettings;
    const w = s?.whatsapp || '+1 (210) 728-9032';
    const wLink = `https://wa.me/${(s?.whatsapp || '12107289032').replace(/\D/g, '')}?text=${encodeURIComponent("Hi, I'm interested in tickets")}`;
    const t = s?.telegramHandle || '@officialticketescrow';
    const tLink = `https://t.me/${(s?.telegramHandle || 'officialticketescrow').replace(/^@/, '')}`;
    return { whatsapp: w, whatsappLink: wLink, telegram: t, telegramLink: tLink };
  }, [defaultAdminSettings]);

  const footerEl = (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
            <a href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              WhatsApp: {contactInfo.whatsapp}
            </a>
            <a href={contactInfo.telegramLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              Telegram: {contactInfo.telegram}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );

  if (isOffline) {
    return (
      <div className="min-h-screen flex flex-col antialiased bg-white">
        {headerNav}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-slate-400 font-medium">Unable to load data. Please check your connection.</p>
            <button onClick={() => fetchAllTickets()} className="mt-4 px-5 py-2 bg-slate-900 text-white text-sm rounded-xl font-semibold hover:bg-slate-700 transition-colors">
              Retry
            </button>
          </div>
        </main>
        {footerEl}
      </div>
    );
  }

  if (token) {
    if (isValidatingApp) {
      return (
        <div className="min-h-screen flex flex-col antialiased bg-white">
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900"></div>
          </main>
        </div>
      );
    }
    if (!isValidApp) return <AppUnavailable />;
  }

  return (
    <div className="min-h-screen flex flex-col antialiased">
      {headerNav}

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="relative overflow-hidden bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium mb-4">
                June &mdash; July 2026 &middot; USA, Canada &amp; Mexico
              </p>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                FIFA World Cup 2026
              </h1>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                Group stage tickets available now. Browse all 72 matches and secure your seats.
              </p>
              <Link
                href={t('/events')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors"
              >
                Browse All Events
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Countdown */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-medium">
              FIFA World Cup 2026 kicks off in
            </p>
            <Countdown />
          </div>
        </section>

        {/* Featured Events */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Events</h2>
              <p className="text-slate-500 text-sm mt-1">Tickets available now</p>
            </div>
            <Link
              href={t('/events')}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              View all
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900"></div>
            </div>
          ) : featuredEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {featuredEvents.map((event) => {
                  const minPrice = getMinPriceFromTickets(event.listings);
                  const isSoldOut = !minPrice;
                  const subtitle = [event.tournament, event.subcategory].filter(Boolean).join(' · ');
                  const baseSlug = `/event-details?name=${encodeURIComponent(event.eventName)}&date=${encodeURIComponent(event.dateTime)}`;
                  const eventSlug = token ? `${baseSlug}&token=${token}` : baseSlug;

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
                        {event.subcategory && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700">
                              {event.subcategory}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {subtitle && (
                          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 font-medium truncate">
                            {subtitle}
                          </p>
                        )}
                        <h3 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-2">
                          {event.eventName}
                        </h3>

                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            <span>{formatDate(event.dateTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                              <path d="M12 21c-4-4-7-7.5-7-10.5a7 7 0 1 1 14 0c0 3-3 6.5-7 10.5z" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            <span className="truncate">{event.venue}, {event.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          {event.listings.length === 0 ? (
                            <span className="text-sm text-amber-600 font-medium">Contact for Price</span>
                          ) : isSoldOut ? (
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

              <div className="mt-8 text-center sm:hidden">
                <Link href={t('/events')} className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                  View all events
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-sm text-slate-400 font-medium">No events available yet. Check back soon.</p>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Three steps between you and the event.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
              {[
                {
                  step: '1',
                  title: 'Browse Events',
                  desc: 'Find tickets for sports, concerts, festivals and more. Filter by category.',
                  icon: (
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  ),
                },
                {
                  step: '2',
                  title: 'Contact Us Directly',
                  desc: 'Reach out via WhatsApp or Telegram. No accounts needed, no hidden fees.',
                  icon: (
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  ),
                },
                {
                  step: '3',
                  title: 'Receive Your Ticket',
                  desc: 'Tickets delivered digitally or arranged for collection.',
                  icon: (
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">
                    <span className="text-slate-400 mr-1.5">{item.step}.</span>
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-slate-500 mb-7 max-w-lg mx-auto">Message us &mdash; tell us the event and we&apos;ll source tickets for you.</p>
            <Link
              href={t('/contact')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-700 transition-colors"
            >
              Contact Us
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <PurchaseToast tickets={tickets} />

      {footerEl}
    </div>
  );
}
