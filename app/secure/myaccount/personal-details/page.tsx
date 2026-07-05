"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';

const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";

export default function PersonalDetailsPage() {
    const router = useRouter();
    const { admin, setAdmin, logout } = useUser();
    
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [formData, setFormData] = useState({
        accountName: '',
        accountEmail: '',
        accountStateCountry: '',
        // adminSettings JSON fields
        whatsapp: '',
        telegramHandle: '',
        telegramId: '',
    });

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
            router.replace('/login');
            return;
        }
        setIsSessionValid(true);
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                let settingsObj: any = {};
                try { settingsObj = JSON.parse(parsed.adminSettings || '{}'); } catch (e) {}
                setFormData({
                    accountName: parsed.accountName || '',
                    accountEmail: parsed.accountEmail || '',
                    accountStateCountry: parsed.accountStateCountry || '',
                    whatsapp: settingsObj.whatsapp || '',
                    telegramHandle: settingsObj.telegramHandle || '',
                    telegramId: settingsObj.telegramId || '',
                });
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        }
    }, [router]);

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!admin) return;
        setSaving(true);
        setMessage(null);

        try {
            // Build adminSettings JSON
            const settingsObj: any = {};
            // Preserve existing keys from the original adminSettings
            try {
                const existing = JSON.parse(admin.adminSettings || '{}');
                Object.assign(settingsObj, existing);
            } catch (e) {}
            
            // Override the contact-specific keys
            settingsObj.whatsapp = formData.whatsapp;
            settingsObj.telegramHandle = formData.telegramHandle;
            settingsObj.telegramId = formData.telegramId;
            
            const finalAdminSettings = JSON.stringify(settingsObj);

            const payload = new URLSearchParams();
            payload.append("action", "updateAdmin");
            payload.append("adminId", admin.adminId);
            payload.append("accountName", formData.accountName);
            payload.append("accountEmail", formData.accountEmail);
            payload.append("accountStateCountry", formData.accountStateCountry);
            payload.append("adminSettings", finalAdminSettings);

            const response = await fetch(APP_SCRIPT_POST_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payload.toString()
            });

            if (response.ok) {
                const updatedAdmin = { 
                    ...admin, 
                    accountName: formData.accountName,
                    accountEmail: formData.accountEmail,
                    accountStateCountry: formData.accountStateCountry,
                    adminSettings: finalAdminSettings
                };
                setAdmin(updatedAdmin);
                localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update. Please try again.' });
            }
        } catch (error) {
            console.error("Error updating admin details:", error);
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setSaving(false);
        }
    };

    if (isSessionValid === null) return null;

    return (
        <div className="flex-1 bg-[#090b0f] min-h-full pb-16">
            <div className="max-w-2xl mx-auto px-6 pt-8">
                <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Profile Settings</h1>
                <p className="text-xs text-white/40 font-bold mb-8">Manage your account details and contact information for buyers.</p>

                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 ${
                        message.type === 'success' 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {message.type === 'success' 
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                        </svg>
                        <span className="font-bold text-sm">{message.text}</span>
                    </div>
                )}

                {/* Account Details */}
                <div className="bg-[#121620]/80 rounded-2xl border border-white/5 p-6 space-y-6 mb-6">
                    <h2 className="text-sm font-black text-white/80 uppercase tracking-widest">Account Details</h2>
                    
                    <div>
                        <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                        <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                            placeholder="Enter your account name"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Account Email</label>
                        <input
                            type="email"
                            name="accountEmail"
                            value={formData.accountEmail}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                            placeholder="Enter your account email"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">State / Country</label>
                        <input
                            type="text"
                            name="accountStateCountry"
                            value={formData.accountStateCountry}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                            placeholder="Enter your state or country"
                        />
                    </div>
                </div>

                {/* Contact Settings (stored inside adminSettings JSON) */}
                <div className="bg-[#121620]/80 rounded-2xl border border-white/5 p-6 space-y-6 mb-6">
                    <div>
                        <h2 className="text-sm font-black text-white/80 uppercase tracking-widest">Contact Settings</h2>
                        <p className="text-[10px] text-white/30 font-medium mt-1">
                            These details are shown to buyers so they can reach you about listed tickets.
                        </p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">WhatsApp Number</label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                            placeholder="e.g. +44 7700 900000"
                        />
                        <p className="text-[9px] text-white/20 font-medium mt-1.5 ml-1">Include country code. Buyers will use this to contact you via WhatsApp.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Telegram Handle</label>
                        <input
                            type="text"
                            name="telegramHandle"
                            value={formData.telegramHandle}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                            placeholder="e.g. @yourhandle"
                        />
                        <p className="text-[9px] text-white/20 font-medium mt-1.5 ml-1">Your public Telegram handle for buyers to contact you.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Telegram ID (for notifications)</label>
                        <input
                            type="text"
                            name="telegramId"
                            value={formData.telegramId}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                            placeholder="e.g. 123456789"
                        />
                        <p className="text-[9px] text-white/20 font-medium mt-1.5 ml-1">Your numeric Telegram ID — used for bot notifications, not shown publicly.</p>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center mb-6"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-3"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>

                {/* Sign Out */}
                <button
                    onClick={logout}
                    className="w-full bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-red-400 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
