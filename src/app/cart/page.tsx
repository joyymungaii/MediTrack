
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, Unsubscribe } from 'firebase/firestore';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Trash2, Loader2, Minus, Plus } from 'lucide-react';
import type { CartItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    let unsubscribe: Unsubscribe | undefined;
    try {
      const cartRef = collection(db, 'users', user.uid, 'cartItems');
      unsubscribe = onSnapshot(cartRef, 
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
          setCartItems(items);
          setIsLoading(false);
        },
        (error) => {
            const permissionError = new FirestorePermissionError({
                path: cartRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsLoading(false);
        }
    );
    } catch (error) {
      console.error("Error setting up cart listener:", error);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading, router]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || !itemId) return;
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    const itemRef = doc(db, 'users', user.uid, 'cartItems', itemId);
    updateDoc(itemRef, { quantity: newQuantity }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'update',
            requestResourceData: { quantity: newQuantity },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!user || !itemId) return;
    const itemRef = doc(db, 'users', user.uid, 'cartItems', itemId);
    deleteDoc(itemRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-primary/5">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Your Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
              <Button asChild className="mt-6">
                <Link href="/medicines">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-primary">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id!, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={item.quantity} readOnly className="w-14 h-8 text-center" />
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id!, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-semibold w-24 text-right">{formatCurrency(item.price * item.quantity)}</p>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id!)}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold font-headline">Order Summary</h2>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Subtotal ({totalItems} items)</p>
                      <p className="font-semibold">{formatCurrency(totalPrice)}</p>
                    </div>
                     <div className="flex justify-between">
                      <p className="text-muted-foreground">Shipping</p>
                      <p className="font-semibold">Calculated at checkout</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4">
                      <p>Total</p>
                      <p>{formatCurrency(totalPrice)}</p>
                    </div>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/medicines">Continue Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
