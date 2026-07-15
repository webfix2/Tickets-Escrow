"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Ticket, Admin } from './types';

const APP_SCRIPT_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";
const APP_SCRIPT_USER_URL = APP_SCRIPT_URL + "?sheetname=user";
const APP_SCRIPT_TICKET_URL = APP_SCRIPT_URL + "?sheetname=ticket";
const APP_SCRIPT_ADMIN_URL = APP_SCRIPT_URL + "?sheetname=admin";

interface UserContextProps {
    user: User | null;
    users: User[];
    ticket: Ticket | null;
    tickets: Ticket[];
    admin: Admin | null;
    loading: boolean;
    isOffline: boolean;
    isAppMode: boolean;
    appAdmin: Admin | null;
    isValidApp: boolean;
    isValidatingApp: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    setAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
    setLoggedInAdmin: React.Dispatch<React.SetStateAction<string | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    fetchAllUsers: () => Promise<void>;
    fetchAllTickets: () => Promise<void>;
    fetchAdminData: (username: string, password: string) => Promise<boolean>;
    fetchUserData: (id: string) => Promise<User | null>;
    loginWithToken: (token: string) => Promise<boolean>;
    verifyAdminSession: () => Promise<{ valid: boolean; status?: string; plan?: string; subscriptionExpiry?: string }>;
    validateAppToken: (token: string) => Promise<boolean>;
    defaultAdminSettings: Record<string, string> | null;
    publicAccessToken: string | null;
    logout: () => void;
}

const UserContext = createContext<UserContextProps>({
    user: null,
    users: [],
    ticket: null,
    tickets: [],
    admin: null,
    loading: true,
    isOffline: false,
    isAppMode: false,
    appAdmin: null,
    isValidApp: false,
    isValidatingApp: true,
    setUser: () => { },
    setUsers: () => { },
    setTicket: () => { },
    setTickets: () => { },
    setAdmin: () => { },
    setLoggedInAdmin: () => { },
    setLoading: () => { },
    fetchAllUsers: async () => { },
    fetchAllTickets: async () => { },
    fetchAdminData: async () => false,
    fetchUserData: async () => null,
    loginWithToken: async () => false,
    verifyAdminSession: async () => ({ valid: false }),
    validateAppToken: async () => false,
    defaultAdminSettings: null,
    publicAccessToken: null,
    logout: () => { },
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [appAdmin, setAppAdmin] = useState<Admin | null>(null);
    const [isValidApp, setIsValidApp] = useState(false);
    const [isValidatingApp, setIsValidatingApp] = useState(true);
    const [defaultAdminSettings, setDefaultAdminSettings] = useState<Record<string, string> | null>(null);
    const [publicAccessToken, setPublicAccessToken] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialLoad = useRef(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const postToGAS = useCallback(async (payload: Record<string, string>) => {
        const body = new URLSearchParams(payload);
        const res = await fetch(APP_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString()
        });
        return res.json();
    }, []);

    const fetchWithRetry = useCallback(async (url: string, retries = 3) => {
      let attempt = 0;
      while (attempt < retries) {
          try {
              const response = await fetch(url);
              if (!response.ok) throw new Error("Network response was not ok");
              setIsOffline(false);
              return await response.json();
          } catch (error) {
              attempt++;
              if (attempt < retries) {
                  console.log(`Retrying... attempt ${attempt}`);
                  await new Promise(resolve => setTimeout(resolve, 5000));
              } else {
                  console.error("Failed to fetch after multiple attempts:", error);
                  setIsOffline(true);
                  throw error;
              }
          }
      }
    }, []);

  const fetchAdminData = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      //setLoading(true);
      const data: Admin[] = await fetchWithRetry(APP_SCRIPT_ADMIN_URL);
      const adminData = data.find((admin) => admin.username === username && admin.password === password);
      
      if (adminData) {
        // Platform Validation: Check if "escrow" is in the allowedPlatform list
        // If the list is empty, we allow access by default for now (to avoid lockout)
        const platformString = adminData.allowedPlatform?.toLowerCase() || "";
        const allowedPlatforms = platformString.split(',').map(p => p.trim()).filter(p => p !== "");
        
        if (allowedPlatforms.length > 0 && !allowedPlatforms.includes("escrow")) {
          alert("Access denied: Your account is not authorized for the Escrow platform.");
          return false;
        }

        // Subscription Validation
        if (adminData.role === 'CUSTOMER' && adminData.status === 'EXPIRED') {
          alert("Your subscription has expired. Please contact the administrator.");
          return false;
        }

                setAdmin(adminData);
                localStorage.setItem("loggedInAdmin", username);
                localStorage.setItem("adminData", JSON.stringify(adminData));
                
                // Save token from sheet data immediately (ensureToken may fail)
                if (adminData.token) {
                    localStorage.setItem("adminToken", adminData.token);
                }
                
                // Auto-generate/retrieve token for this admin
                try {
                    const tokenResult = await postToGAS({ action: "ensureToken", adminId: adminData.adminId });
                    if (tokenResult.success && tokenResult.token) {
                        adminData.token = tokenResult.token;
                        localStorage.setItem("adminData", JSON.stringify(adminData));
                        localStorage.setItem("adminToken", tokenResult.token);
                    }
                } catch (err) {
                    console.error("Token generation error:", err);
                }
                
                return true;
      } else {
        alert("Invalid admin credentials!");
        localStorage.removeItem("loggedInAdmin");
        localStorage.removeItem("adminData");
        setAdmin(null);
        return false;
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      return false;
    } finally {
      //setLoading(false);
    }
  }, [fetchWithRetry]);


    const validateAppToken = useCallback(async (token: string): Promise<boolean> => {
      console.log("[UserContext] validateAppToken: validating", token);
      setIsValidatingApp(true);
      try {
        const data: Admin[] = await fetchWithRetry(APP_SCRIPT_ADMIN_URL);
        const found = data.find(a => a.token === token);
        console.log("[UserContext] validateAppToken: admin found?", !!found);
        if (found) {
          setAppAdmin(found);
          const ticketsData: Ticket[] = await fetchWithRetry(APP_SCRIPT_TICKET_URL);
          const filtered = ticketsData.filter(t =>
            t.admin === found.username &&
            (!t.deletedSTAMP || t.deletedSTAMP.trim() === "") &&
            t.ticketStatus?.toUpperCase() === 'ACTIVE' &&
            (t.platform || '').toLowerCase().split(',').map(p => p.trim()).includes('escrow')
          );
          console.log(`[UserContext] validateAppToken: ${filtered.length} tickets for ${found.username}`);
          setTickets(filtered);
          setIsValidApp(true);
          setLoading(false);
          return true;
        } else {
          setIsValidApp(false);
          return false;
        }
      } catch {
        console.log("[UserContext] validateAppToken: fetch failed");
        setIsValidApp(false);
        return false;
      } finally {
        console.log("[UserContext] validateAppToken: done, isValidatingApp=false");
        setIsValidatingApp(false);
      }
    }, [fetchWithRetry]);

    const logout = useCallback(() => {
        localStorage.removeItem("loggedInAdmin");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("allUsersData");
        localStorage.removeItem("allTicketsData");
        setAdmin(null);
        setLoggedInAdmin(null);
        setUsers([]);
        setTickets([]);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (typeof caches !== 'undefined') {
            caches.keys().then(names => Promise.all(names.map(name => caches.delete(name)))).then(() => {
                window.location.href = '/login';
            });
        } else {
            window.location.href = '/login';
        }
    }, []);

    const verifyAdminSession = useCallback(async () => {
        const token = localStorage.getItem("adminToken");
        if (token) return { valid: true };
        const adminData = localStorage.getItem("adminData");
        if (!adminData) return { valid: false };
        try {
            const parsed: Admin = JSON.parse(adminData);
            if (parsed.token) return { valid: true };
            return await postToGAS({ action: "verifyAdminSession", adminId: parsed.adminId });
        } catch {
            return { valid: false };
        }
    }, [postToGAS]);

    const loginWithToken = useCallback(async (token: string): Promise<boolean> => {
        try {
            const data = await postToGAS({ action: "adminLoginByToken", token });
            if (data.success && data.admin) {
                setAdmin(data.admin);
                setLoggedInAdmin(data.admin.username);
                localStorage.setItem("loggedInAdmin", data.admin.username);
                localStorage.setItem("adminData", JSON.stringify(data.admin));
                localStorage.setItem("adminToken", token);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Token login error:", error);
            return false;
        }
    }, [postToGAS]);

    const fetchUserData = useCallback(async (id: string): Promise<User | null> => { // Corrected implementation
        try {
            const data: User[] = await fetchWithRetry(APP_SCRIPT_USER_URL);
            const userData = data.find((row: User) => row.userId === id);
            if (userData) {
                setUser(userData);
                return userData;
            } else {
                router.push('/invalid');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            router.push('/invalid');
            return null;
        } finally {
            //setLoading(false);
        }
    }, [router, fetchWithRetry]);

  const fetchAllUsers = useCallback(async () => {
    try {
      //setLoading(true);
      const data: User[] = await fetchWithRetry(APP_SCRIPT_USER_URL);
      const adminUsername = localStorage.getItem("loggedInAdmin");
      const filteredData = adminUsername ? data.filter(u => u.admin === adminUsername) : data;
      setUsers(filteredData);
      localStorage.setItem('allUsersData', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching all users:', error);
    } finally {
      //setLoading(false);
    }
  }, [fetchWithRetry]);

  const fetchTicketData = useCallback(async (ticketId: string) => {
    try {
      //setLoading(true);
      const data: Ticket[] = await fetchWithRetry(APP_SCRIPT_TICKET_URL);
      const ticketData = data.find((row: Ticket) => row.ticketId === ticketId);
      if (ticketData) {
        setTicket(ticketData);
        localStorage.setItem('ticketData', JSON.stringify(ticketData));
      }
    } catch (error) {
      console.error('Error fetching ticket data:', error);
    } finally {
      //setLoading(false);
    }
  }, [fetchWithRetry]);

  const fetchAllTickets = useCallback(async () => {
    console.log("[UserContext] fetchAllTickets started");
    const safetyTimeout = setTimeout(() => {
      console.log("[UserContext] fetchAllTickets: safety timeout triggered");
      setLoading(false);
    }, 10000);
    try {
      setLoading(true);
      const data: Ticket[] = await fetchWithRetry(APP_SCRIPT_TICKET_URL);
      clearTimeout(safetyTimeout);
      const adminUsername = localStorage.getItem("loggedInAdmin");
      const filteredData = adminUsername ? data.filter(t => t.admin === adminUsername) : data;
      console.log(`[UserContext] fetchAllTickets: ${data.length} raw, ${filteredData.length} filtered`);
      setTickets(filteredData);
      localStorage.setItem('allTicketsData', JSON.stringify(data));
    } catch (error) {
      console.error('[UserContext] fetchAllTickets error:', error);
    } finally {
      clearTimeout(safetyTimeout);
      console.log("[UserContext] fetchAllTickets: loading=false");
      setLoading(false);
    }
  }, [fetchWithRetry]);

  const refreshData = () => {
      initialLoad.current = true;
  };

  useEffect(() => {
      const idFromUrl = searchParams.get('id');
      const urlToken = searchParams.get('token');

      // Sync token: URL → localStorage, fallback to stored token
      let resolvedToken: string | null = null;
      if (urlToken) {
        localStorage.setItem('publicAccessToken', urlToken);
        resolvedToken = urlToken;
      } else {
        resolvedToken = localStorage.getItem('publicAccessToken');
      }
      setPublicAccessToken(resolvedToken);

      // Not in app mode (no token) - mark validation as done
      if (!resolvedToken) {
        setIsValidatingApp(false);
      }

      // If in app mode (public pages with token), delegate to validateAppToken
      if (resolvedToken && !localStorage.getItem("loggedInAdmin")) {
        validateAppToken(resolvedToken);
        return;
      }

      const cachedAllUsersData = localStorage.getItem('allUsersData');
      const cachedAllTicketsData = localStorage.getItem('allTicketsData');
      const currentPath = window.location.pathname;

      if (idFromUrl) {
          fetchUserData(idFromUrl);
      } else if (!currentPath.startsWith('/login')) {
          //router.push('/invalid');
      }

      if (user && user.ticketId) {
          fetchTicketData(user.ticketId);
      }

      if (initialLoad.current) {
          initialLoad.current = false;

          if (cachedAllUsersData) {
              try {
                  const usersData = JSON.parse(cachedAllUsersData);
                  const adminUsername = localStorage.getItem("loggedInAdmin");
                  const filteredData = adminUsername ? usersData.filter((u: User) => u.admin === adminUsername) : usersData;
                  setUsers(filteredData);
              } catch (e) {
                  console.error("Error parsing cached all users data", e);
                  localStorage.removeItem('allUsersData');
                  fetchAllUsers();
              }
          } else {
              fetchAllUsers();
          }

          if (cachedAllTicketsData) {
              try {
                  const ticketsData = JSON.parse(cachedAllTicketsData);
                  const adminUsername = localStorage.getItem("loggedInAdmin");
                  const filteredData = adminUsername ? ticketsData.filter((t: Ticket) => t.admin === adminUsername) : ticketsData;
                  console.log(`[UserContext] Cache hit: ${filteredData.length} tickets loaded`);
                  setTickets(filteredData);
                  setLoading(false);
                  fetchAllTickets();
              } catch (e) {
                  console.error("[UserContext] Cache parse error:", e);
                  localStorage.removeItem('allTicketsData');
                  fetchAllTickets();
              }
          } else {
              console.log("[UserContext] No cache, fetching tickets...");
              fetchAllTickets();
          }
      }

      if (idFromUrl && user && user.userId !== idFromUrl) {
          localStorage.removeItem('ticketData');
          setTicket(null);
      }

      // Fetch default admin settings for public pages (contact info)
      if (!appAdmin) {
        fetchWithRetry(APP_SCRIPT_ADMIN_URL).then((data: Admin[]) => {
          const first = data?.[0];
          if (first?.adminSettings) {
            try {
              const parsed = JSON.parse(first.adminSettings);
              if (parsed.whatsapp || parsed.telegramHandle) {
                setDefaultAdminSettings(parsed);
              }
            } catch {}
          }
        }).catch(() => {});
      }
  }, [searchParams, router, fetchUserData, fetchAllUsers, fetchAllTickets, fetchTicketData, validateAppToken]);

  // Restore admin session from localStorage + background refresh
  useEffect(() => {
    const storedAdminData = localStorage.getItem("adminData");
    
    if (storedAdminData) {
      try {
        const parsed: Admin = JSON.parse(storedAdminData);
        setAdmin(parsed);
        setLoggedInAdmin(parsed.username);

        // Background refresh: fetch latest admin data from sheet
        (async () => {
          try {
            const freshAdminData = await fetchWithRetry(APP_SCRIPT_ADMIN_URL) as Admin[];
            const matching = freshAdminData.find(a => a.adminId === parsed.adminId);
            if (matching) {
              // Preserve token from stored data (token is app-managed, not from sheet)
              matching.token = parsed.token;
              setAdmin(matching);
              setLoggedInAdmin(matching.username);
              localStorage.setItem("adminData", JSON.stringify(matching));
              localStorage.setItem("loggedInAdmin", matching.username);
            }
          } catch (e) {
            // Silently ignore — stale cache data is still shown
          }
        })();
      } catch (e) {
        console.error("Error parsing stored admin data", e);
        localStorage.removeItem("adminData");
        localStorage.removeItem("loggedInAdmin");
      }
    }
  }, [fetchWithRetry]);

  const value = useMemo(() => ({
    user,
    users,
    ticket,
    tickets,
    admin,
    loading,
    isOffline,
    isAppMode: !!appAdmin,
    appAdmin,
    isValidApp,
    isValidatingApp,
    setUser,
    setUsers,
    setTicket,
    setTickets,
    setAdmin,
    setLoggedInAdmin,
    setLoading,
    fetchAllUsers,
    fetchAllTickets,
    fetchAdminData,
    fetchUserData,
    loginWithToken,
    verifyAdminSession,
    validateAppToken,
    defaultAdminSettings,
    publicAccessToken,
    logout,
  }), [
    user,
    users,
    ticket,
    tickets,
    admin,
    loading,
    isOffline,
    appAdmin,
    isValidApp,
    isValidatingApp,
    defaultAdminSettings,
    publicAccessToken,
    setUser,
    setUsers,
    setTicket,
    setTickets,
    setAdmin,
    setLoggedInAdmin,
    setLoading,
    fetchAllUsers,
    fetchAllTickets,
    fetchAdminData,
    fetchUserData,
    loginWithToken,
    verifyAdminSession,
    validateAppToken,
    logout,
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
