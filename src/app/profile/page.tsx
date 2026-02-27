'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getUserOrders, getUserPrescriptions } from '@/lib/firestore';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Package, FileText, Phone, Mail, Calendar, CheckCircle2, Truck, Clock, MapPin } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { formatCurrency } from '@/lib/utils';
import type { Order, Prescription } from '@/lib/types';

interface UserProfile {
  fullName?: string;
  name?: string;
  email?: string;
  tel?: string;
  dob?: string;
  role?: string;
  createdAt?: string;
}

const ORDER_STEPS = ['Pending', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered'] as const;

function getStepIndex(status: string): number {
  if (status === 'Paid') return 1;
  if (status === 'Cancelled') return -1;
  const index = ORDER_STEPS.findIndex(s => s === status);
  return index >= 0 ? index : 0;
}

function DeliveryStepper({ status }: { status: string }) {
  const currentStep = getStepIndex(status);
  const isCancelled = status === 'Cancelled';

  if (isCancelled) {
    return (
      <Badge variant="destructive" className="mt-2">Cancelled</Badge>
    );
  }

  return (
    <div className="flex items-center gap-0 mt-4 w-full overflow-x-auto">
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index <= currentStep;
        const isCurrent = index === currentStep;
        const StepIcon = index === 0 ? Clock
          : index === 1 ? Package
          : index === 2 ? Truck
          : index === 3 ? MapPin
          : CheckCircle2;

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors ${
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/30 text-muted-foreground/50'
              } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background' : ''}`}>
                <StepIcon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] text-center leading-tight ${
                isCompleted ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {step}
              </span>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                index < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProfilePageContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const [profileSnap, userOrders, userPrescriptions] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getUserOrders(db, user.uid).catch(() => []),
          getUserPrescriptions(db, user.uid).catch(() => []),
        ]);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        }
        setOrders(userOrders as Order[]);
        setPrescriptions(userPrescriptions as Prescription[]);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-headline">
                      {profile?.fullName || profile?.name || 'User'}
                    </CardTitle>
                    <CardDescription>{profile?.role === 'admin' ? 'Pharmacist' : 'Customer'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{profile?.email || user?.email || 'N/A'}</span>
                </div>
                {profile?.tel && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{profile.tel}</span>
                  </div>
                )}
                {profile?.dob && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{new Date(profile.dob).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {profile?.createdAt && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    {'Member since '}
                    {new Date(profile.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders & Prescriptions */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="orders">
                <TabsList className="w-full">
                  <TabsTrigger value="orders" className="flex-1 gap-2">
                    <Package className="h-4 w-4" />
                    Orders ({orders.length})
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="flex-1 gap-2">
                    <FileText className="h-4 w-4" />
                    Prescriptions ({prescriptions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="mt-4 space-y-4">
                  {orders.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No orders yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-sm font-headline">
                                {'Order #'}{order.id?.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.createdAt?.toDate
                                  ? order.createdAt.toDate().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
                                  : 'Date pending'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{order.paymentMethod}</Badge>
                              <span className="font-semibold text-primary">{formatCurrency(order.total)}</span>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground mb-1">
                            {order.items?.length || 0} item(s)
                            {order.items?.slice(0, 3).map((item, i) => (
                              <span key={i}>{i === 0 ? ': ' : ', '}{item.name}</span>
                            ))}
                            {(order.items?.length || 0) > 3 && <span>{' and more...'}</span>}
                          </div>

                          <DeliveryStepper status={order.status} />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-4 space-y-4">
                  {prescriptions.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No prescriptions uploaded</p>
                      </CardContent>
                    </Card>
                  ) : (
                    prescriptions.map((presc) => (
                      <Card key={presc.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm font-headline">
                                Prescription #{presc.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {presc.uploadedAt?.toDate
                                  ? presc.uploadedAt.toDate().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
                                  : 'Date pending'}
                              </p>
                              {presc.notes && (
                                <p className="text-xs text-muted-foreground mt-1">Notes: {presc.notes}</p>
                              )}
                              {presc.reviewNotes && (
                                <p className="text-xs mt-1">
                                  <span className="font-medium">Pharmacist review: </span>
                                  {presc.reviewNotes}
                                </p>
                              )}
                            </div>
                            <Badge className={statusColors[presc.status] || ''} variant="outline">
                              {presc.status.charAt(0).toUpperCase() + presc.status.slice(1)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
