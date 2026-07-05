"use client";

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimesCircle,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface SidebarItem {
    icon: IconDefinition;
    label: string;
    active: boolean;
    href?: string;
    action?: () => void;
}

interface SidebarProps {
    sidebarItems: SidebarItem[];
    isSidebarOpen: boolean;
    onClose: () => void;
    adminUsername: string | undefined;
}

const Sidebar: React.FC<SidebarProps> = ({
    sidebarItems,
    isSidebarOpen,
    onClose,
    adminUsername
}) => {
    return (
        <aside
            className={`fixed inset-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:relative lg:translate-x-0 lg:flex-shrink-0
            bg-black transition-transform duration-300 ease-in-out
            lg:bg-[#0f121a] lg:rounded-2xl lg:shadow-2xl lg:p-6 lg:w-64 border-r border-white/5 lg:border lg:border-white/5
            `}
        >
            <div className="h-full flex flex-col p-8 lg:p-0">
                {/* Sidebar Header Mobile */}
                <div className="flex items-center justify-end mb-12 lg:hidden">
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimesCircle} size="2x" />
                    </button>
                </div>

                {/* Admin Badge */}
                <div className="hidden lg:flex items-center space-x-3 mb-8 px-4">
                    <div className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 font-black text-sm">
                        {adminUsername?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="text-sm font-black text-white">{adminUsername || 'Admin'}</p>
                        <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Escrow Admin</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 lg:px-0 lg:py-0">
                    {sidebarItems.map((item, index) => (
                        item.href && item.href !== '#' ? (
                            <Link key={index} href={item.href} onClick={onClose} className={`flex items-center px-4 py-3 rounded-[12px] transition-all
                                ${item.active
                                    ? 'bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/20'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 font-bold'}
                            `}>
                                <FontAwesomeIcon icon={item.icon} className="w-5 mr-3" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ) : (
                            <button
                                key={index}
                                onClick={() => {
                                    if (item.action) item.action();
                                    onClose();
                                }}
                                className={`flex items-center w-full text-left px-4 py-3 rounded-[12px] transition-all
                                    ${item.active
                                        ? 'bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/20'
                                        : (item.label === 'Sign Out' 
                                            ? 'text-red-500 hover:bg-red-500/10 font-bold' 
                                            : 'text-white/60 hover:text-white hover:bg-white/5 font-bold')}
                                `}
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-5 mr-3" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        )
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
