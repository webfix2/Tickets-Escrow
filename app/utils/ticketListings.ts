import { Ticket } from '../types';

export interface Listing {
  section: string;
  row: string;
  seatNumbers: string;
  price: string;
  currency: string;
  notes: string;
}

export function parseListings(ticket: Ticket): Listing[] {
  if (ticket.ticketListings) {
    try {
      const parsed = JSON.parse(ticket.ticketListings);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((l: any) => ({
          section: String(l.section ?? ''),
          row: String(l.row ?? ''),
          seatNumbers: String(l.seatNumbers ?? ''),
          price: String(l.price ?? ''),
          currency: String(l.currency ?? 'USD'),
          notes: String(l.notes ?? ''),
        }));
      }
    } catch {}
  }

  return [{
    section: ticket.section || '',
    row: ticket.row || '',
    seatNumbers: ticket.seatNumbers || '',
    price: ticket.paymentSettings || '',
    currency: ticket.currency || 'USD',
    notes: ticket.description || '',
  }];
}

export function getMinPrice(ticket: Ticket): number | null {
  const listings = parseListings(ticket);
  const prices = listings
    .map(l => parseFloat(l.price))
    .filter(p => !isNaN(p) && p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getListingCount(ticket: Ticket): number {
  return parseListings(ticket).length;
}
