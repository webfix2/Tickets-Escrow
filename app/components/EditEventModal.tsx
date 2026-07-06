"use client";

import { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { Ticket } from '../types';

interface EditEventModalProps {
  eventName: string;
  dateTime: string;
  onClose: () => void;
}

export default function EditEventModal({ eventName: initialEventName, dateTime: initialDateTime, onClose }: EditEventModalProps) {
  const { tickets, fetchAllTickets } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group all listings belonging to this specific event
  const currentListings = tickets.filter(t => {
    const isNotDeleted = !t.deletedSTAMP || t.deletedSTAMP.trim() === "";
    return isNotDeleted && t.eventName.trim().toLowerCase() === initialEventName.trim().toLowerCase() && t.dateTime === initialDateTime;
  });

  // Get base event details from the first matching row
  const firstRow = currentListings[0] || {} as Ticket;

  const [category, setCategory] = useState(firstRow.category || 'Football');
  const [tournament, setTournament] = useState(firstRow.tournament || '');
  const [subcategory, setSubcategory] = useState(firstRow.subcategory || '');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  
  const [venue, setVenue] = useState(firstRow.venue || '');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [dateTime, setDateTime] = useState(firstRow.dateTime || '');
  const [coverImage, setCoverImage] = useState(firstRow.coverImage || '');
  const [ticketStatus, setTicketStatus] = useState(firstRow.ticketStatus || '');

  // Local listings editor state
  const [listings, setListings] = useState<Array<{
    ticketId?: string; // If existing row, has ticketId
    section: string;
    row: string;
    seatNumbers: string;
    price: string;
    currency: string;
    notes: string;
  }>>([]);

  const isTeamSport = category.toLowerCase() === 'football' || category.toLowerCase() === 'boxing' || category.toLowerCase() === 'rugby';

  // Initialize fields
  useEffect(() => {
    // Parse Home vs Away
    const name = firstRow.eventName || '';
    const vsMatch = name.match(/(.+?)\s+vs\s+(.+)/i);
    if (vsMatch) {
      setHomeTeam(vsMatch[1].trim());
      setAwayTeam(vsMatch[2].trim());
    } else {
      setEventTitle(name);
    }

    // Parse location (City, Country)
    const loc = firstRow.location || '';
    const parts = loc.split(',');
    if (parts.length >= 2) {
      setCity(parts[0].trim());
      setCountry(parts.slice(1).join(',').trim());
    } else {
      setCity(loc);
      setCountry('');
    }

    // Parse existing listings
    // Filter out rows that are purely empty "Sold Out" rows
    const validListings = currentListings.filter(t => t.section);
    setListings(validListings.map(t => ({
      ticketId: t.ticketId,
      section: t.section || '',
      row: t.row || '',
      seatNumbers: t.seatNumbers || '',
      price: t.paymentSettings || '',
      currency: t.currency || 'USD',
      notes: t.description || '',
    })));
  }, [firstRow]);

  const handleAddRow = () => {
    setListings([...listings, { section: '', row: '', seatNumbers: '', price: '', currency: 'USD', notes: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...listings];
    updated.splice(index, 1);
    setListings(updated);
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    const updated = [...listings];
    updated[index] = { ...updated[index], [field]: value };
    setListings(updated);
  };

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

    const finalEventName = isTeamSport ? `${homeTeam} vs ${awayTeam}` : eventTitle;
    const finalLocation = `${city}, ${country}`;

    if (!finalEventName.trim() || !venue.trim() || !city.trim() || !country.trim() || !dateTime) {
      setError("Please fill in all required event details.");
      setLoading(false);
      return;
    }

    try {
      const POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";

      // 1. Determine which listings are deleted, added, or updated
      const existingListingIds = currentListings.map(l => l.ticketId);

      // Filter active listings in the form
      const formListings = listings.filter(l => l.section && l.price);

      // If formListings is empty, it means sold out. We need to save exactly 1 row with empty listing fields
      // to represent the sold out event. We can use the first matching row in our sheet for this.
      const listingsToSave = formListings.length > 0 
        ? formListings 
        : [{ ticketId: firstRow.ticketId, section: '', row: '', seatNumbers: '', price: '', currency: 'USD', notes: '' }];

      const savedTicketIds = new Set<string>();

      for (let i = 0; i < listingsToSave.length; i++) {
        const item = listingsToSave[i];
        const isUpdate = !!item.ticketId && existingListingIds.includes(item.ticketId);
        const targetTicketId = item.ticketId || `t-${Date.now()}-${i}`;
        
        savedTicketIds.add(targetTicketId);

        const payload = new URLSearchParams();
        payload.append("action", isUpdate ? "updateTicket" : "addTicket");
        if (isUpdate) payload.append("ticketId", targetTicketId);
        payload.append("admin", adminUsername);
        
        // Event metadata
        payload.append("eventName", finalEventName);
        payload.append("category", category);
        payload.append("tournament", tournament);
        payload.append("subcategory", subcategory);
        payload.append("venue", venue);
        payload.append("location", finalLocation);
        payload.append("dateTime", dateTime);
        payload.append("coverImage", coverImage);
        if (isUpdate) payload.append("ticketStatus", ticketStatus);
        payload.append("platform", "escrow");

        // Listing specific info
        payload.append("section", item.section);
        payload.append("row", item.row);
        payload.append("seatNumbers", item.seatNumbers);
        payload.append("paymentSettings", item.price);
        payload.append("currency", item.currency);
        payload.append("description", item.notes);

        console.log('[EditEventModal] Sending payload:', Object.fromEntries(payload));
        const response = await fetch(POST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload.toString()
        });

        const responseText = await response.text();
        console.log('[EditEventModal] Response:', responseText, 'Status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to save listing row: ${item.section || 'empty listing'}`);
        }
      }

      // 2. Soft-delete any previously existing rows not in savedTicketIds
      const deletedListingIds = existingListingIds.filter(id => !savedTicketIds.has(id));
      
      for (const delId of deletedListingIds) {
        const payload = new URLSearchParams();
        payload.append("action", "deleteTicket");
        payload.append("ticketId", delId);
        payload.append("deletedSTAMP", new Date().toLocaleString());

        await fetch(POST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload.toString()
        });
      }

      alert("Event updated successfully!");
      fetchAllTickets();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while updating the event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0f121a] border border-white/5 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-black tracking-tight text-white">Edit Event</h2>
            
            {/* Active toggle */}
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Active Listing</span>
              <button
                type="button"
                onClick={() => setTicketStatus(ticketStatus === 'ACTIVE' || !ticketStatus ? 'HIDDEN' : 'ACTIVE')}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                  ticketStatus === 'ACTIVE' || !ticketStatus ? 'bg-emerald-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <span className="bg-[#0f121a] w-4 h-4 rounded-full shadow-md"></span>
              </button>
            </div>
          </div>

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
                  className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 relative"
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
