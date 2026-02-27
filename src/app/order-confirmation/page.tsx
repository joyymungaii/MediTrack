
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ProtectedRoute } from '@/components/protected-route';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !orderId || !user) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            const orderRef = doc(db, 'orders', orderId);
            try {
                const orderSnap = await getDoc(orderRef);
                if (orderSnap.exists() && orderSnap.data().userId === user.uid) {
                    setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
                } else {
                     const permissionError = new FirestorePermissionError({
                        path: orderRef.path,
                        operation: 'get',
                    });
                    errorEmitter.emit('permission-error', permissionError);
                }
            } catch (error: any) {
                 if (error.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({
                        path: orderRef.path,
                        operation: 'get',
                    });
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                    console.error("Error fetching order:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, user, authLoading]);

    if (loading || authLoading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">Order Not Found</h2>
                <p className="text-muted-foreground">We couldn't find the order details. Please check the URL or go back to the homepage.</p>
                <Button asChild className="mt-6"><Link href="/">Go to Homepage</Link></Button>
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center items-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <CardTitle className="text-3xl font-headline">Thank You for Your Order!</CardTitle>
                <CardDescription>
                    Your order has been placed successfully. Order ID: <strong>{order.id}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 p-4 bg-primary/10 rounded-md">
                    <h3 className="font-semibold">Order Summary</h3>
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                </div>
                <div className="space-y-2 p-4 bg-secondary rounded-md">
                    <h3 className="font-semibold">Shipping Details</h3>
                    <p className="text-sm"><strong>Name:</strong> {order.shippingAddress.fullName}</p>
                    <p className="text-sm"><strong>Address:</strong> {order.shippingAddress.address}</p>
                    <p className="text-sm"><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                </div>
                <div className="space-y-2 p-4 bg-secondary rounded-md">
                    <h3 className="font-semibold">Payment Information</h3>
                    <p className="text-sm"><strong>Method:</strong> {order.paymentMethod}</p>
                    <p className="text-sm"><strong>Status:</strong> <span className={`font-medium ${order.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.status}</span></p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/medicines">Continue Shopping</Link>
                </Button>
            </CardContent>
        </Card>
    )
}


export default function OrderConfirmationPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-primary/5">
          <div className="container mx-auto px-4 py-12 md:py-20">
              <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                  <OrderConfirmationContent />
              </Suspense>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
