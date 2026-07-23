"use client";

import { useMemo, useEffect, useState } from 'react';
import { Ticket } from '../types';
import { parseListings } from '../utils/ticketListings';

interface PurchaseToastProps {
  tickets: Ticket[];
  eventName?: string;
}

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

interface Notification {
  name: string;
  location: string;
  qty: string;
  ticketType: string;
  eventName: string;
}

export default function PurchaseToast({ tickets, eventName: overrideEventName }: PurchaseToastProps) {
  const notifications = useMemo(() => {
    if (!tickets.length) return [];

    const eventNames = new Set<string>();
    const listings: Array<{ section: string; eventName: string }> = [];

    tickets.forEach(t => {
      if (t.deletedSTAMP?.trim()) return;
      if (t.ticketStatus?.toUpperCase() !== 'ACTIVE') return;
      const pList = (t.platform || '').toLowerCase().split(',').map(p => p.trim());
      if (!pList.includes('escrow')) return;

      const en = t.eventName.trim();
      if (overrideEventName && en.toLowerCase() === overrideEventName.toLowerCase()) return;
      if (en) eventNames.add(en);

      parseListings(t).forEach(l => {
        if (l.section) listings.push({ section: l.section, eventName: en });
      });
    });

    if (!listings.length && !eventNames.size) return [];

    const items: Notification[] = [];
    const eventArr = Array.from(eventNames);
    const quantities = ['2', '3', '4', '5', '6'];

    for (let i = 0; i < 20; i++) {
      const person = people[i % people.length];
      const listing = listings.length > 0 ? listings[i % listings.length] : null;
      const targetEvent = overrideEventName || (eventArr.length > 0 ? eventArr[i % eventArr.length] : 'the event');
      const ticketType = listing ? listing.section : ['General Admission', 'VIP', 'Standard', 'Hospitality', 'Premium'][i % 5];

      items.push({
        name: person.name,
        location: person.location,
        qty: quantities[i % quantities.length],
        ticketType,
        eventName: targetEvent,
      });
    }
    return items;
  }, [tickets, overrideEventName]);

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notifications.length) return;
    const show = setTimeout(() => setVisible(true), 3000);
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(prev => (prev + 1) % notifications.length);
        setVisible(true);
      }, 2000);
    }, 7000);
    return () => { clearTimeout(show); clearInterval(cycle); };
  }, [notifications.length]);

  if (!notifications.length) return null;

  const n = notifications[idx];

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 right-4 z-50 w-80 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
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
          onClick={() => setVisible(false)}
          className="text-slate-300 hover:text-slate-500 shrink-0 leading-none text-xl mt-0.5"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
