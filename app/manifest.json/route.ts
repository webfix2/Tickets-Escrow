import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const startUrl = token ? `/login?token=${encodeURIComponent(token)}` : '/login';

  const manifest = {
    name: 'Ticketmaster',
    short_name: 'Ticketmaster',
    description: 'Buy and sell concert, sports and theatre tickets',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#026CDF',
    theme_color: '#026CDF',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/splash-1024x1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'splash' },
    ],
    screenshots: [
      { src: '/splash-1170x2532.png', sizes: '1170x2532', type: 'image/png', form_factor: 'narrow' },
      { src: '/splash-2048x2732.png', sizes: '2048x2732', type: 'image/png', form_factor: 'wide' },
    ],
  };

  return NextResponse.json(manifest);
}
