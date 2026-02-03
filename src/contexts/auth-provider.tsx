"use client";

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

// Mock user type
interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a mock AuthProvider. In a real app, you would integrate Firebase Auth.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate checking for a logged-in user from a session
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.email.includes('admin')) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    // Simulate a login
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = { uid: '123', email };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));

    if (email.includes('admin')) {
      setIsAdmin(true);
      router.push('/admin/dashboard');
    } else {
      setIsAdmin(false);
      router.push('/');
    }
    toast({ title: "Login Successful", description: `Welcome back, ${email}!` });
    setLoading(false);
  };

  const register = async (email: string) => {
    // Simulate a registration
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = { uid: '123', email };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setIsAdmin(false);
    router.push('/');
    toast({ title: "Registration Successful", description: `Welcome, ${email}!` });
    setLoading(false);
  };

  const logout = async () => {
    // Simulate a logout
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('user');
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    setLoading(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
