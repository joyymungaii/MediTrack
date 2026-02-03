
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Pill, Users, PackageCheck, AlertCircle, FileText } from "lucide-react";
import { Order, Medicine, Prescription } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, limit, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This will be replaced by live data
const mockMedicines: Medicine[] = [
  { id: "MED001", name: "Paracetamol 500mg", stock: 150, price: 599, category: "Pain Relief", imageUrl: "", description: "" },
  { id: "MED002", name: "Ibuprofen 200mg", stock: 80, price: 850, category: "Pain Relief", imageUrl: "", description: "" },
  { id: "MED003", name: "Vitamin C 1000mg", stock: 200, price: 1200, category: "Vitamins", imageUrl: "", description: "" },
  { id: "MED004", name: "Loratadine 10mg", stock: 8, price: 1575, category: "Allergy", imageUrl: "", description: "" },
  { id: "MED005", name: "Cough Syrup", stock: 3, price: 925, category: "Cold & Flu", imageUrl: "", description: "" },
];

const orderStatusStyles = {
    'Pending': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    'Paid': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'Processing': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'Shipped': 'bg-green-500/20 text-green-700 border-green-500/30',
    'Delivered': 'bg-primary/20 text-primary border-primary/30',
    'Cancelled': 'bg-gray-500/20 text-gray-700 border-gray-500/30',
}

const prescriptionStatusStyles = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-600 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
};


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      totalSales: 0,
      totalOrders: 0,
      totalMedicines: 0,
      lowStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    let unsubOrders: Unsubscribe;
    let unsubPrescriptions: Unsubscribe;
    let unsubAllOrders: Unsubscribe;

    try {
        const lowStockItems = mockMedicines.filter(m => m.stock < 10).length;
        setStats(prev => ({ ...prev, totalMedicines: mockMedicines.length, lowStockItems }));
        
        // Fetch recent 5 orders
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
          setRecentOrders(data);
          setLoading(false);
        }, (error) => {
            console.error("Error fetching recent orders:", error);
            setLoading(false);
        });

        // Fetch recent 5 prescriptions
        const prescriptionsQuery = query(collection(db, "prescriptions"), orderBy("uploadedAt", "desc"), limit(5));
        unsubPrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Prescription));
          setRecentPrescriptions(data);
          setLoading(false);
        }, (error) => {
            console.error("Error fetching recent prescriptions:", error);
            setLoading(false);
        });

        // Listen to all orders to calculate total sales and count
        const allOrdersQuery = query(collection(db, "orders"));
        unsubAllOrders = onSnapshot(allOrdersQuery, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => doc.data() as Order);
            const totalSales = allOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
            const totalOrders = allOrders.length;
            setStats(prev => ({...prev, totalSales, totalOrders}));
        });

        return () => {
            if (unsubOrders) unsubOrders();
            if (unsubPrescriptions) unsubPrescriptions();
            if (unsubAllOrders) unsubAllOrders();
        }

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
    }
  }, []);

  if (loading && recentOrders.length === 0 && recentPrescriptions.length === 0) {
      return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
  }

  const statCards = [
    { title: "Total Sales", value: formatCurrency(stats.totalSales), icon: DollarSign },
    { title: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag },
    { title: "Total Medicines", value: stats.totalMedicines.toString(), icon: Pill },
    { title: "Low Stock Items", value: stats.lowStockItems.toString(), icon: AlertCircle, variant: stats.lowStockItems > 0 ? "destructive" : "default" },
  ]

  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
                 <Card key={index} className={stat.variant === 'destructive' ? 'bg-destructive/10 border-destructive/50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Latest Orders</CardTitle>
                        <CardDescription>A preview of the most recent orders.</CardDescription>
                    </div>
                    <Button variant="link" asChild><Link href="/admin/orders">View All</Link></Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentOrders.length > 0 ? recentOrders.map(order => (
                            <div key={order.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{order.shippingAddress.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{order.shippingAddress.fullName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.createdAt?.toDate().toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-right">
                                    <p>{formatCurrency(order.total)}</p>
                                    <Badge variant="outline" className={cn("mt-1 capitalize", orderStatusStyles[order.status])}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No recent orders.</p>}
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Prescriptions</CardTitle>
                        <CardDescription>The latest uploaded prescriptions for verification.</CardDescription>
                    </div>
                    <Button variant="link" asChild><Link href="/admin/prescriptions">View All</Link></Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentPrescriptions.length > 0 ? recentPrescriptions.map(p => (
                            <div key={p.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <FileText className="h-5 w-5" />
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{p.patientName}</p>
                                    <p className="text-sm text-muted-foreground">{p.email}</p>
                                </div>
                                <div className="ml-auto font-medium text-right">
                                    <Badge variant="outline" className={cn("capitalize", prescriptionStatusStyles[p.status])}>
                                        {p.status}
                                    </Badge>
                                     <p className="text-sm text-muted-foreground mt-1">
                                        {p.uploadedAt?.toDate().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No recent prescriptions.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    