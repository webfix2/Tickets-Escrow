"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import { Ticket } from '../../../types';
import AddEventModal from '../../../components/AddEventModal';
import EditEventModal from '../../../components/EditEventModal';

export default function EventDashboardPage() {
    const router = useRouter();
    const {
        admin,
        tickets: allTickets,
        fetchAllTickets,
        setAdmin,
        setLoggedInAdmin,
        logout,
    } = useUser();

    const [localAdmin, setLocalAdmin] = useState<string | null>(null);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editEvent, setEditEvent] = useState<{ eventName: string; dateTime: string } | null>(null);

    // Session initialization
    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            router.replace('/login');
            return;
        }
        setIsSessionValid(true);
        const adminUsername = localStorage.getItem("loggedInAdmin");
        const adminData = localStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setLocalAdmin(adminUsername);
                fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        } else if (admin) {
            setLocalAdmin(admin.username || admin.adminId);
            fetchAllTickets();
        }
    }, [setAdmin, router, fetchAllTickets, setLoggedInAdmin]);

    // Group tickets into unique events for this admin
    const groupedEvents = useMemo(() => {
        if (!Array.isArray(allTickets) || !localAdmin) return [];

        const groups: Record<string, {
            eventName: string;
            dateTime: string;
            venue: string;
            location: string;
            category: string;
            coverImage: string;
            ticketStatus: string;
            listings: Ticket[];
            totalListings: number;
        }> = {};

        allTickets.forEach(ticket => {
            // Only show this admin's tickets
            if (ticket.admin !== localAdmin) return;
            const isNotDeleted = !ticket.deletedSTAMP || ticket.deletedSTAMP.trim() === "";
            if (!isNotDeleted) return;

            const groupKey = `${ticket.eventName.trim().toLowerCase()}_${ticket.dateTime}`;

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    eventName: ticket.eventName,
                    dateTime: ticket.dateTime,
                    venue: ticket.venue || "TBA",
                    location: ticket.location || "TBA",
                    category: ticket.category || "Event",
                    coverImage: ticket.coverImage || "",
                    ticketStatus: ticket.ticketStatus || "ACTIVE",
                    listings: [],
                    totalListings: 0,
                };
            }

            // Count valid listings (with section and price)
            if (ticket.section && ticket.paymentSettings) {
                groups[groupKey].listings.push(ticket);
                groups[groupKey].totalListings++;
            }
        });

        return Object.values(groups);
    }, [allTickets, localAdmin]);

    // Filter by search
    const filteredEvents = useMemo(() => {
        if (!searchQuery.trim()) return groupedEvents;
        const q = searchQuery.toLowerCase();
        return groupedEvents.filter(event =>
            event.eventName.toLowerCase().includes(q) ||
            event.venue.toLowerCase().includes(q) ||
            event.location.toLowerCase().includes(q) ||
            event.category.toLowerCase().includes(q)
        );
    }, [groupedEvents, searchQuery]);

    // Helpers
    const formatEventDate = (dateStr: string) => {
        if (!dateStr) return "TBD";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch { return dateStr; }
    };

    const getCurrencySymbol = (code: string) => {
        const symbols: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', NGN: '₦' };
        return symbols[code.toUpperCase()] || code;
    };

    const getMinPrice = (listings: Ticket[]) => {
        if (listings.length === 0) return null;
        let min = Infinity;
        let currency = 'USD';
        listings.forEach(l => {
            const price = parseFloat(l.paymentSettings || '0');
            if (price < min) {
                min = price;
                currency = l.currency || 'USD';
            }
        });
        return { price: min, currency };
    };

    if (isSessionValid === null) return null;

    return (
        <div className="flex-1 flex flex-col bg-[#090b0f] min-h-full pb-8">
            {/* Dashboard Header */}
            <div className="px-6 pt-8 pb-6 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Event Dashboard</h1>
                        <p className="text-xs text-white/40 font-bold mt-1">
                            {groupedEvents.length} event{groupedEvents.length !== 1 ? 's' : ''} •
                            {groupedEvents.reduce((sum, e) => sum + e.totalListings, 0)} total listings
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2.5 bg-[#121620] border border-white/10 rounded-xl text-white text-xs placeholder-white/30 outline-none focus:border-emerald-500/50 w-56 transition-all"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Add Event Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Event</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Event Table / Cards */}
            <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
                {filteredEvents.length > 0 ? (
                    <div className="space-y-3">
                        {filteredEvents.map((event, i) => {
                            const minPrice = getMinPrice(event.listings);
                            const isHidden = event.ticketStatus?.toUpperCase() === 'HIDDEN';

                            return (
                                <div
                                    key={i}
                                    className={`bg-[#121620]/80 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 transition-all hover:border-emerald-500/20 cursor-pointer group ${
                                        isHidden ? 'border-white/5 opacity-60' : 'border-white/5'
                                    }`}
                                    onClick={() => setEditEvent({ eventName: event.eventName, dateTime: event.dateTime })}
                                >
                                    {/* Cover Thumbnail */}
                                    <div className="w-full md:w-32 aspect-video md:aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                        {event.coverImage ? (
                                            <img src={event.coverImage} alt={event.eventName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Info */}
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-white font-black text-lg tracking-tight leading-snug truncate">{event.eventName}</h3>
                                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {event.category}
                                            </span>
                                            {isHidden && (
                                                <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    Hidden
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/40 font-medium">
                                            <span className="flex items-center space-x-1.5">
                                                <svg className="w-3.5 h-3.5 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{event.venue}, {event.location}</span>
                                            </span>
                                            <span className="flex items-center space-x-1.5">
                                                <svg className="w-3.5 h-3.5 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{formatEventDate(event.dateTime)}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats & Edit */}
                                    <div className="flex items-center gap-6 shrink-0">
                                        {/* Listings Count */}
                                        <div className="text-center">
                                            <p className="text-lg font-black text-white">{event.totalListings}</p>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Listings</p>
                                        </div>

                                        {/* Price Range */}
                                        <div className="text-center">
                                            {minPrice ? (
                                                <>
                                                    <p className="text-lg font-black text-emerald-400">{getCurrencySymbol(minPrice.currency)}{minPrice.price}</p>
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">From</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-lg font-black text-red-400">—</p>
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sold Out</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Edit Arrow */}
                                        <div className="text-white/20 group-hover:text-emerald-400 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="py-24 text-center max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/30 border border-white/5">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-white">No Events Yet</h3>
                        <p className="text-sm text-white/50">
                            Create your first event to start listing tickets for sale.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 px-8 py-3 bg-emerald-500 text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            + Add Your First Event
                        </button>
                    </div>
                )}
            </main>

            {/* Modals */}
            {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} />}
            {editEvent && (
                <EditEventModal
                    eventName={editEvent.eventName}
                    dateTime={editEvent.dateTime}
                    onClose={() => setEditEvent(null)}
                />
            )}
        </div>
    );
}
