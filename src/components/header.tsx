'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/icons';
import { User, LogOut, LayoutDashboard, ShoppingCart, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { href: '/medicines', label: 'Medicines' },
  { href: '/symptom-checker', label: 'Symptom Checker' },
  { href: '/upload-prescription', label: 'Upload Prescription' },
];

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      setCartItemCount(0);
      return;
    }

    const cartRef = collection(db, 'users', user.uid, 'cartItems');
    const unsubscribe: Unsubscribe = onSnapshot(cartRef, (snapshot) => {
      let totalItems = 0;
      snapshot.forEach(doc => {
        totalItems += doc.data().quantity || 0;
      });
      setCartItemCount(totalItems);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };
  
  const NavLinkItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              MediTrack Pro
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLinkItems />
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="p-4">
                  <Link href="/" className="mr-6 flex items-center space-x-2 mb-6" onClick={() => setMobileMenuOpen(false)}>
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline">MediTrack Pro</span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    <NavLinkItems />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                        {cartItemCount}
                      </Badge>
                    )}
                    <span className="sr-only">Cart</span>
                </Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
