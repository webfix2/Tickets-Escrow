"use client";

import { useState } from 'react';
import { useUser } from '../UserContext';
import { Ticket } from '../types';

interface AddEventModalProps {
  onClose: () => void;
}

export default function AddEventModal({ onClose }: AddEventModalProps) {
  const { fetchAllTickets } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState('Football');
  const [tournament, setTournament] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Ticket listings rows state
  const [listings, setListings] = useState<Array<{
    section: string;
    row: string;
    seatNumbers: string; // Comma-separated seat numbers
    price: string;       // paymentSettings
    currency: string;
    notes: string;       // description
  }>>([
    { section: '', row: '', seatNumbers: '', price: '', currency: 'USD', notes: '' }
  ]);

  const handleAddRow = () => {
    setListings([...listings, { section: '', row: '', seatNumbers: '', price: '', currency: 'USD', notes: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...listings];
    updated.splice(index, 1);
    setListings(updated.length ? updated : [{ section: '', row: '', seatNumbers: '', price: '', currency: 'USD', notes: '' }]);
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    const updated = [...listings];
    updated[index] = { ...updated[index], [field]: value };
    setListings(updated);
  };

  const isTeamSport = category.toLowerCase() === 'football' || category.toLowerCase() === 'boxing' || category.toLowerCase() === 'rugby';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const adminUsername = localStorage.getItem("loggedInAdmin");
    if (!adminUsername) {
      setError("Admin session expired. Please log in again.");
      setLoading(false);
      return;
    }

    // Construct event details
    const finalEventName = isTeamSport ? `${homeTeam} vs ${awayTeam}` : eventTitle;
    const finalLocation = `${city}, ${country}`;

    if (!finalEventName.trim() || !venue.trim() || !city.trim() || !country.trim() || !dateTime) {
      setError("Please fill in all required event details.");
      setLoading(false);
      return;
    }

    try {
      const POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";
      const baseTicketId = "t-" + Date.now();

      // Loop through all listings. If no listings are provided, we create one default empty listing row
      // to keep the match registered in the system as "Sold Out"
      const listingsToSave = listings.some(l => l.section && l.price)
        ? listings.filter(l => l.section && l.price)
        : [{ section: '', row: '', seatNumbers: '', price: '', currency: 'USD', notes: '' }];

      for (let i = 0; i < listingsToSave.length; i++) {
        const listing = listingsToSave[i];
        
        const payload = new URLSearchParams();
        payload.append("action", "addTicket");
        payload.append("admin", adminUsername);
        payload.append("ticketId", `${baseTicketId}-${i}`);
        
        // Event info
        payload.append("eventName", finalEventName);
        payload.append("category", category);
        payload.append("tournament", tournament);
        payload.append("subcategory", subcategory);
        payload.append("venue", venue);
        payload.append("location", finalLocation);
        payload.append("dateTime", dateTime);
        payload.append("coverImage", coverImage);
        payload.append("ticketStatus", "ACTIVE");
        payload.append("platform", "escrow");

        // Listing specific info
        payload.append("section", listing.section);
        payload.append("row", listing.row);
        payload.append("seatNumbers", listing.seatNumbers);
        payload.append("paymentSettings", listing.price);
        payload.append("currency", listing.currency);
        payload.append("description", listing.notes);

        console.log('[AddEventModal] Sending payload:', Object.fromEntries(payload));
        const response = await fetch(POST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload.toString()
        });

        const responseText = await response.text();
        console.log('[AddEventModal] Response:', responseText, 'Status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to save listing ${i + 1}`);
        }
      }

      alert("Event created successfully!");
      fetchAllTickets();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while creating the event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0f121a] border border-white/5 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-black tracking-tight text-white">Add New Event</h2>
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-white p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 text-sm">
          {/* General Event Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5">
            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white"
              >
                <option value="Football">Football</option>
                <option value="Concerts">Concert</option>
                <option value="Festivals">Festival</option>
                <option value="Boxing">Boxing</option>
                <option value="Rugby">Rugby</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Tournament</label>
              <input
                type="text"
                value={tournament}
                onChange={(e) => setTournament(e.target.value)}
                placeholder="e.g. FIFA World Cup 2026"
                className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Subcategory</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Group A · match day 1"
                className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
              />
            </div>

            {isTeamSport ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Home Team *</label>
                  <input
                    type="text"
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    placeholder="e.g. Real Madrid"
                    className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Away Team *</label>
                  <input
                    type="text"
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    placeholder="e.g. Barcelona"
                    className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Event Title *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Taylor Swift Live"
                  className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Venue *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Wembley Stadium"
                className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London"
                  className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. UK"
                  className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">Cover Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full p-4 bg-[#161922] border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-white placeholder-white/20"
              />
            </div>
          </div>

          {/* Ticket Listings Grid Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center ml-1">
              <h3 className="text-md font-black text-white tracking-tight">Ticket Listings</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs font-black uppercase text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>+ Add Row</span>
              </button>
            </div>

            <div className="space-y-4">
              {listings.map((row, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 relative group"
                >
                  <div>
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-wider mb-1">Section/Area *</label>
                    <input
                      type="text"
                      value={row.section}
                      onChange={(e) => handleRowChange(index, 'section', e.target.value)}
                      placeholder="e.g. Block A"
                      className="w-full p-3 bg-[#161922] rounded-lg text-white font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-wider mb-1">Row</label>
                    <input
                      type="text"
                      value={row.row}
                      onChange={(e) => handleRowChange(index, 'row', e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full p-3 bg-[#161922] rounded-lg text-white font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-wider mb-1">Seat Numbers</label>
                    <input
                      type="text"
                      value={row.seatNumbers}
                      onChange={(e) => handleRowChange(index, 'seatNumbers', e.target.value)}
                      placeholder="e.g. 101, 102"
                      className="w-full p-3 bg-[#161922] rounded-lg text-white font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-wider mb-1">Price *</label>
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full p-3 bg-[#161922] rounded-lg text-white font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-wider mb-1">Currency *</label>
                    <select
                      value={row.currency}
                      onChange={(e) => handleRowChange(index, 'currency', e.target.value)}
                      className="w-full p-3 bg-[#161922] rounded-lg text-white font-bold outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-wider mb-1">Notes</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleRowChange(index, 'notes', e.target.value)}
                        placeholder="e.g. Seated"
                        className="w-full p-3 bg-[#161922] rounded-lg text-white font-bold outline-none"
                      />
                      {listings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-bold transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-500 text-slate-900 rounded-xl font-black shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-3"></div>
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
