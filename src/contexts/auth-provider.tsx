"use client";

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const appUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: userData.role || 'customer'
          };
          setUser(appUser);
          setIsAdmin(appUser.role === 'admin');
        } else {
          // This case can happen if the user document wasn't created on signup
          // Or for users created before this logic was in place.
          const role = firebaseUser.email?.includes('admin') ? 'admin' : 'customer';
          const userProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            role: role
          };
          await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
          const appUser: User = { ...userProfile, displayName: userProfile.name };
          setUser(appUser);
          setIsAdmin(appUser.role === 'admin');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'customer';
      
      toast({ title: "Login Successful", description: `Welcome back!` });

      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "An unknown error occurred.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else {
        message = error.message;
      }
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const role = email.includes('admin') ? 'admin' : 'customer';

      const userProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || email.split('@')[0],
        role: role
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
      
      toast({ title: "Registration Successful", description: `Welcome, ${email}!` });
      if(role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error("Registration error:", error);
       let message = "An unknown error occurred.";
       if (error.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use.';
      } else {
        message = error.message;
      }
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch(error: any) {
        console.error("Logout error:", error);
        toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } finally {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
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