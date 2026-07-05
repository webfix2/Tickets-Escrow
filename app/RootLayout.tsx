"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLock, faTicketAlt, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { UserProvider, useUser } from './UserContext';
import { useState } from 'react';
import Image from 'next/image';

library.add(faPhone, faLock, faTicketAlt, faUser, faSearch);

export default function RootLayoutWrapper({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: { className: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem("loggedInAdmin");
    setLoggedInAdmin(null);
    router.push('/');
  };

  const openTicketmasterLink = (path: string) => {
    const ticketmasterBase = 'https://www.ticketmaster.com';
    const fullUrl = `${ticketmasterBase}${path}`;
    window.open(fullUrl, '_self');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query !== '') {
      const searchUrl = `https://www.ticketmaster.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_self');
    }
  };

  const shouldShowHeaderFooter = false;

  return (
    <div className={`${inter.className} bg-[#f5f5f5] min-h-screen flex flex-col`}>
      {shouldShowHeaderFooter && (
        <>
          {/* Ticketmaster-styled header */}
          <header className="fixed top-0 left-0 right-0 z-10 bg-[#026CDF] shadow-md">
            {/* Top navigation bar */}
            <div className="bg-[#001B41] text-white py-1 px-4">
              <div className="container mx-auto flex justify-end items-center text-xs">
                <button
                  onClick={() => openTicketmasterLink('/help')}
                  className="mr-4 hover:underline"
                >
                  Help
                </button>

                <button
                  onClick={() => openTicketmasterLink('/member')}
                  className="flex items-center hover:underline"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1" />
                  My Account
                </button>
              </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src="https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no"
                  alt="Ticketmaster"
                  width={40}
                  height={40}
                  className="sm:hidden rounded-full"
                  unoptimized={true}
                />
                <div className="text-white font-black text-2xl hidden sm:flex items-center">
                  <Image
                    src="https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no"
                    alt="Ticketmaster"
                    width={32}
                    height={32}
                    className="mr-2 rounded-full"
                    unoptimized={true}
                  />
                  <span>ticketmaster</span>
                </div>
              </Link>

              {/* Navigation */}
              <div className="hidden lg:flex items-center space-x-6 text-white">
                <button
                  onClick={() => openTicketmasterLink('/concerts')}
                  className="hover:text-[#F5A623] font-medium"
                >
                  Concerts
                </button>
                <button
                  onClick={() => openTicketmasterLink('/sports')}
                  className="hover:text-[#F5A623] font-medium"
                >
                  Sports
                </button>
                <button
                  onClick={() => openTicketmasterLink('/arts')}
                  className="hover:text-[#F5A623] font-medium"
                >
                  Arts & Theater
                </button>
                <button
                  onClick={() => openTicketmasterLink('/family')}
                  className="hover:text-[#F5A623] font-medium"
                >
                  Family
                </button>
                <button
                  onClick={() => openTicketmasterLink('/more')}
                  className="hover:text-[#F5A623] font-medium"
                >
                  More
                </button>
              </div>

              {/* Mobile menu */}
              <div className="lg:hidden flex items-center">
                <button className="text-white p-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="bg-white py-3 px-4 shadow-sm">
              <div className="container mx-auto">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for artists, venues, or events"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#026CDF]"
                    />
                    <button type="submit">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {shouldShowHeaderFooter && (
        <footer className="bg-[#001B41] text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Help & Support</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/help')}
                      className="hover:text-[#F5A623]"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/faq')}
                      className="hover:text-[#F5A623]"
                    >
                      FAQs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/contact')}
                      className="hover:text-[#F5A623]"
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/accessibility')}
                      className="hover:text-[#F5A623]"
                    >
                      Accessibility
                    </button>
                  </li>
                </ul>
              </div>

              {/* My Account (Static) */}
              <div>
                <h3 className="text-lg font-bold mb-4">My Account</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/account" className="hover:text-[#F5A623]">
                      My Tickets
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/favorites" className="hover:text-[#F5A623]">
                      Favorites
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/settings" className="hover:text-[#F5A623]">
                      Account Settings
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Discover</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/gift-cards')}
                      className="hover:text-[#F5A623]"
                    >
                      Gift Cards
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/vip')}
                      className="hover:text-[#F5A623]"
                    >
                      VIP Access
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/deals')}
                      className="hover:text-[#F5A623]"
                    >
                      Deals & Promotions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openTicketmasterLink('/groups')}
                      className="hover:text-[#F5A623]"
                    >
                      Groups & Packages
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                <div className="flex space-x-4 mb-6">
                  {/* Social Icons */}
                  {/* Add your social links here */}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Get the Ticketmaster App</h4>
                  <div className="flex space-x-2">
                    <a href="#" className="block">
                      <img
                        src="https://placehold.co/120x40/001B41/FFFFFF?text=App+Store"
                        alt="App Store"
                        className="h-10"
                      />
                    </a>
                    <a href="#" className="block">
                      <img
                        src="https://placehold.co/120x40/001B41/FFFFFF?text=Google+Play"
                        alt="Google Play"
                        className="h-10"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
