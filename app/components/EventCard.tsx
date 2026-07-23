"use client";

import React from 'react';
import Link from 'next/link';
import { Ticket } from '../types';
import { parseListings } from '../utils/ticketListings';

interface EventCardProps {
  eventName: string;
  dateTime: string;
  venue: string;
  location: string;
  category: string;
  coverImage: string;
  listings: Ticket[];
}

export const EventCard: React.FC<EventCardProps> = ({
  eventName,
  dateTime,
  venue,
  location,
  category,
  coverImage,
  listings,
}) => {
  // Format Date and Time nicely
  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Fallback if string is already formatted
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  const formatEventTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "";
    }
  };

  // Find lowest price
  const allListings = listings.flatMap(t => parseListings(t));
  const activeListings = allListings.filter(l => l.section || l.price);
  const isSoldOut = activeListings.length === 0;

  const minPriceInfo = (() => {
    if (isSoldOut) return null;
    let minPrice = Infinity;
    let minCurrency = "USD";
    activeListings.forEach(l => {
      const price = parseFloat(l.price || '0');
      if (price > 0 && price < minPrice) {
        minPrice = price;
        minCurrency = l.currency || "USD";
      }
    });
    return isFinite(minPrice) ? { price: minPrice, currency: minCurrency } : null;
  })();

  // Separate team names if Football category and eventName contains 'vs'
  const isTeamSport = category?.toLowerCase() === 'football' || category?.toLowerCase() === 'boxing' || category?.toLowerCase() === 'rugby';
  const vsMatch = eventName.match(/(.+?)\s+vs\s+(.+)/i);

  const displayTitle = () => {
    if (isTeamSport && vsMatch) {
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-white font-black text-xl tracking-tight leading-none">{vsMatch[1].trim()}</span>
          <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase">VS</span>
          <span className="text-white font-black text-xl tracking-tight leading-none">{vsMatch[2].trim()}</span>
        </div>
      );
    }
    return <h3 className="text-white font-black text-xl tracking-tight leading-snug line-clamp-2">{eventName}</h3>;
  };

  // Format currency symbol
  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      USD: '$', GBP: '£', EUR: '€', NGN: '₦'
    };
    return symbols[code.toUpperCase()] || code;
  };

  return (
    <Link 
      href={`/event-details?name=${encodeURIComponent(eventName)}&date=${encodeURIComponent(dateTime)}`}
      className="block group bg-[#161920]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 shadow-2xl hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Cover Image Section */}
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={eventName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/20">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
          {category || 'Event'}
        </div>

        {/* Sold Out / Price Overlay */}
        <div className="absolute bottom-4 right-4">
          {isSoldOut ? (
            <span className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Sold Out
            </span>
          ) : (
            minPriceInfo && (
              <span className="bg-emerald-500 backdrop-blur-md text-slate-900 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-lg">
                {getCurrencySymbol(minPriceInfo.currency)}{minPriceInfo.price}+
              </span>
            )
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 space-y-4">
        {displayTitle()}

        <div className="space-y-2 pt-2 border-t border-white/5">
          {/* Venue & Location */}
          <div className="flex items-start text-white/50 space-x-2 text-xs">
            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="font-medium">
              <p className="text-white/80 font-bold line-clamp-1">{venue}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold opacity-60">{location}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center text-white/50 space-x-2 text-xs">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-bold text-white/80">
              {formatEventDate(dateTime)}
              {formatEventTime(dateTime) && <span className="text-white/40 ml-1.5">• {formatEventTime(dateTime)}</span>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
