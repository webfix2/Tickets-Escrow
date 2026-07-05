"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.replace('/secure/myaccount/tickets');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}
