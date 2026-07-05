"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../../UserContext';
import { Ticket } from '../../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft,
    faCalendarAlt,
    faMapMarkerAlt,
    faChevronRight,
    faBarcode,
    faEllipsisV,
    faMap,
    faShareAlt,
    faRoute,
    faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import TransferModal from '../../../../components/TransferModal';

export default function TicketDetailsAccountPage() {
    const router = useRouter();
    const params = useParams();
    const ticketId = params.id as string;
    
    const {
        admin,
        tickets: allTickets,
        fetchAllTickets,
        setAdmin,
        setTickets,
        setLoggedInAdmin,
        setUsers,
    } = useUser();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'tickets' | 'extras'>('tickets');

    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            return void router.replace('/login');
        }
        setIsSessionValid(true);
        const adminUsername = localStorage.getItem("loggedInAdmin");
        const adminData = localStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                if (allTickets.length === 0) fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        } else if (allTickets.length === 0 && admin) {
            fetchAllTickets();
        }
    }, [setAdmin, router, allTickets.length, fetchAllTickets, setLoggedInAdmin]);

    useEffect(() => {
        if (isSessionValid && allTickets.length > 0) {
            const foundTicket = allTickets.find(t => t.ticketId === ticketId || t.sn === ticketId);
            if (foundTicket) {
                setTicket(foundTicket);
            }
        }
    }, [allTickets, ticketId, isSessionValid]);

    if (isSessionValid === null || !ticket) return null;

    const seats = ticket.seatNumbers ? ticket.seatNumbers.split(',').map(s => s.trim()) : [ticket.seat || '1'];

    return (
        <div className="h-screen flex flex-col bg-white font-sans">
            {/* ===== LOCKED TOP SECTION (always visible) ===== */}
            <div className="flex-shrink-0">

                {/* Hero image — extends behind notch, buttons overlaid */}
                <div className="relative w-full h-[30vh] bg-black -mt-[env(safe-area-inset-top)]" style={{ minHeight: '180px' }}>
                    {ticket.coverImage && (
                        <img
                            src={ticket.coverImage}
                            alt={ticket.eventName}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Back + Help overlaid on image */}
                    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
                        <Link
                            href="/secure/myaccount/tickets"
                            className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </Link>
                        <button className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white text-xs font-black uppercase tracking-widest">
                            Help
                        </button>
                    </div>

                    {/* Date overlay */}
                    <div className="absolute bottom-0 left-0 bg-[#1F1F1F] px-4 py-2">
                        <p className="text-white text-[11px] font-black uppercase tracking-[0.1em]">
                            {ticket.dateTime || 'FRI • JUL 17, 2026 • 7:30 PM'}
                        </p>
                    </div>
                </div>

                {/* Event info */}
                <div className="bg-[#1F1F1F] p-6 text-white">
                    <h1 className="text-[26px] font-black leading-tight uppercase mb-4 tracking-tighter">
                        {ticket.eventName}
                    </h1>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white/60">{ticket.venue}</p>
                            <p className="text-sm font-bold text-white/60">{ticket.location}</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                            <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M0 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V6z" />
                                <path d="M14 4h4a2 2 0 012 2v8a2 2 0 01-2 2h-4V4z" />
                            </svg>
                            <span className="text-xs font-black">x{seats.length}</span>
                        </div>
                    </div>
                </div>

                {/* View Tickets button */}
                <div className="px-4 py-4 bg-white">
                    <button className="w-full bg-[#026CDF] text-white py-3.5 rounded-md font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-4 shadow-xl active:scale-[0.98] transition-all">
                        <FontAwesomeIcon icon={faBarcode} className="text-lg" />
                        <span>View Tickets</span>
                    </button>
                </div>
            </div>

            {/* ===== SCROLLABLE BOTTOM SECTION ===== */}
            <div className="flex-1 overflow-y-auto bg-white px-4">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 -mx-4 px-4">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`flex-1 py-4 font-black text-[12px] uppercase tracking-widest border-b-[3px] transition-all ${activeTab === 'tickets' ? 'border-[#026CDF] text-[#001B41]' : 'border-transparent text-gray-400'}`}
                    >
                        Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('extras')}
                        className={`flex-1 py-4 font-black text-[12px] uppercase tracking-widest border-b-[3px] transition-all ${activeTab === 'extras' ? 'border-[#026CDF] text-[#001B41]' : 'border-transparent text-gray-400'}`}
                    >
                        Extras
                    </button>
                </div>

                {/* Ticket Details List */}
                {activeTab === 'tickets' && (
                    <div className="mt-6 space-y-8 animate-in fade-in duration-500 pb-[120px]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-[#001B41]">Order #{ticket.ticketId.toUpperCase()}</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1">{seats.length} Tickets</p>
                            </div>
                            <button className="w-10 h-10 flex items-center justify-center text-gray-300">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {seats.map((seatNum, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-[#F0F2F5] px-6 py-3">
                                        <p className="text-[10px] font-black text-[#001B41]/40 uppercase tracking-widest">
                                            ENGENE Member Presale
                                        </p>
                                    </div>
                                    <div className="p-6 grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Section</p>
                                            <p className="text-base font-black text-[#001B41] uppercase">{ticket.section}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Row</p>
                                            <p className="text-base font-black text-[#001B41] uppercase">{ticket.row}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seat</p>
                                            <p className="text-base font-black text-[#001B41] uppercase">{seatNum}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* More Options / Map Section */}
                        <div className="pt-12 space-y-8">
                            <h4 className="text-lg font-black text-[#001B41] uppercase tracking-tight">More Options</h4>

                            {/* Venue Map Card */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="relative aspect-video bg-gray-200">
                                    <iframe
                                        title="Venue Map"
                                        loading="lazy"
                                        className="w-full h-full absolute inset-0"
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(ticket.venue + ' ' + ticket.location)}&output=embed`}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow">
                                        <h5 className="text-sm font-black text-[#1F1F1F]">{ticket.venue}</h5>
                                    </div>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ticket.venue + ' ' + ticket.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-[#F0F2F5] py-4 text-sm font-black text-[#001B41] uppercase tracking-widest hover:bg-gray-200 transition-colors text-center"
                                >
                                    Get Directions
                                </a>
                            </div>

                            {/* Social Share Card */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="relative aspect-[2/1]">
                                    <img src={ticket.coverImage} alt="Event" className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent flex items-center px-8">
                                        <div className="max-w-[180px]">
                                            <h5 className="text-2xl font-black text-[#001B41] leading-tight">YOU GOT TICKETS!</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h6 className="text-lg font-black text-[#001B41]">Post on Social Media</h6>
                                    <p className="text-sm font-bold text-gray-400 mt-2">Build hype for the event, and share that you got tickets with your friends and family</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Pill */}
            <div className="fixed bottom-[40px] left-1/2 -translate-x-1/2 flex items-center bg-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] rounded-full border border-gray-100 p-1.5 z-[110] min-w-[280px]" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex-1 flex flex-col items-center justify-center py-2 px-6 text-[#026CDF] active:opacity-50 transition-all border-r border-gray-100"
                >
                    <FontAwesomeIcon icon={faShareAlt} className="text-xl mb-1 rotate-[-45deg]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Transfer</span>
                </button>
                <button
                    onClick={() => window.open('https://www.ticketmaster.com/sell', '_blank')}
                    className="flex-1 flex flex-col items-center justify-center py-2 px-6 text-gray-300 active:opacity-50 transition-all"
                >
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center mb-1">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Sell</span>
                </button>
            </div>

            {/* Transfer Modal */}
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                ticket={ticket}
            />
        </div>
    );
}
