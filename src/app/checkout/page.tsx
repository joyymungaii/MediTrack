'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { CartItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createOrder } from '@/lib/firestore';
import MpesaDialog from '@/components/mpesa-dialog';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  address: z.string().min(1, { message: 'Delivery address is required' }),
  phone: z.string().min(8, { message: 'Phone number must be at least 8 digits.' }),
  paymentMethod: z.enum(['MPESA', 'Cash on Delivery'], {
    required_error: 'You need to select a payment method.',
  }),
});

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isMpesaDialogOpen, setIsMpesaDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      address: '',
      phone: '',
      paymentMethod: 'MPESA',
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    let unsubscribe: Unsubscribe | undefined;
    try {
      const cartRef = collection(db, 'users', user.uid, 'cartItems');
      unsubscribe = onSnapshot(cartRef, (snapshot) => {
        if (snapshot.empty) {
            router.push('/medicines');
            return;
        }
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        setCartItems(items);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setIsLoading(false);
    }

    return () => {
        if (unsubscribe) {
          unsubscribe();
        }
    };
  }, [user, authLoading, router]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || cartItems.length === 0) return;
    setIsPlacingOrder(true);
    
    const orderData = {
        items: cartItems,
        total: totalPrice,
        status: values.paymentMethod === 'MPESA' ? 'Paid' as const : 'Pending' as const,
        paymentMethod: values.paymentMethod,
        shippingAddress: {
            fullName: values.fullName,
            address: values.address,
            phone: values.phone,
        }
    };

    if (values.paymentMethod === 'MPESA') {
      setIsMpesaDialogOpen(true);
      // The MpesaDialog will handle the order creation on success
    } else {
      try {
        const orderId = await createOrder(db, user.uid, orderData, cartItems);
        router.push(`/order-confirmation?orderId=${orderId}`);
      } catch (error) {
        console.error("Error placing order:", error);
        setIsPlacingOrder(false);
      }
    }
  };

  const handleMpesaSuccess = async () => {
    if (!user) return;
    const values = form.getValues();
    const orderData = {
        items: cartItems,
        total: totalPrice,
        status: 'Paid' as const,
        paymentMethod: 'MPESA' as const,
        shippingAddress: {
            fullName: values.fullName,
            address: values.address,
            phone: values.phone,
        }
    };
    try {
        const orderId = await createOrder(db, user.uid, orderData, cartItems);
        router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
        console.error("Error placing order after MPESA:", error);
    } finally {
        setIsPlacingOrder(false);
        setIsMpesaDialogOpen(false);
    }
  };

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
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Checkout</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold font-headline mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input placeholder="0712345678" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl><Input placeholder="123 Main St, Nairobi" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold font-headline mb-4">Payment Method</h2>
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[[data-state=checked]]:border-primary">
                                <FormControl><RadioGroupItem value="MPESA" /></FormControl>
                                <FormLabel className="font-normal flex-1 cursor-pointer">
                                  <div className="flex justify-between items-center">
                                    <span>MPESA</span>
                                    <Image src="/mpesa-logo.png" alt="MPESA" width={60} height={20} />
                                  </div>
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[[data-state=checked]]:border-primary">
                                <FormControl><RadioGroupItem value="Cash on Delivery" /></FormControl>
                                <FormLabel className="font-normal flex-1 cursor-pointer">Cash on Delivery</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold font-headline">Order Summary</h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <p className="flex-1 truncate pr-2">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4">
                      <p>Total</p>
                      <p>{formatCurrency(totalPrice)}</p>
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={isPlacingOrder}>
                      {isPlacingOrder ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Order...</> : 'Place Order'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
       <MpesaDialog
        isOpen={isMpesaDialogOpen}
        onClose={() => {
            setIsMpesaDialogOpen(false);
            setIsPlacingOrder(false);
        }}
        amount={totalPrice}
        onSuccess={handleMpesaSuccess}
      />
    </div>
  );
}
