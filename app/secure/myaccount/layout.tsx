"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { admin } = useUser();
    const [redirecting, setRedirecting] = useState(false);

    // Auth guard — redirect to login if no adminToken
    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
            setRedirecting(true);
            router.replace('/login');
        }
    }, [router]);

    if (redirecting) return null;

    const pathParts = pathname.split('/').filter(Boolean);
    const isDetailView = pathParts.length > 3;
    
    const isTicketsList = pathname.endsWith('/tickets');
    const isPersonalDetails = pathname.includes('/personal-details');

    return (
        <div className="min-h-screen bg-[#090b0f] flex flex-col font-sans">
            {/* Shared Mobile Header */}
            {!isDetailView && (
                <header className="bg-[#0e1118]/80 backdrop-blur-md text-white px-6 h-[72px] fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/5 shadow-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-900 shadow-md shadow-emerald-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-base font-black tracking-tight text-white">Tickets<span className="text-emerald-400">Escrow</span></span>
                            <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold -mt-0.5">
                                {isTicketsList ? 'Event Dashboard' : isPersonalDetails ? 'Profile Settings' : 'Admin'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Nav Links */}
                        <button 
                            onClick={() => router.push('/secure/myaccount/tickets')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                isTicketsList 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            Events
                        </button>
                        <button 
                            onClick={() => router.push('/secure/myaccount/personal-details')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                isPersonalDetails 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            Profile
                        </button>
                        <button 
                            onClick={() => router.push('/')}
                            className="text-white/30 hover:text-white/60 transition-colors"
                            title="View Public Site"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                    </div>
                </header>
            )}

            <div className={`flex-1 flex flex-col ${!isDetailView ? 'pt-[72px]' : ''}`}>
                {children}
            </div>
        </div>
    );
}
