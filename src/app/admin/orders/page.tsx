'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { columns } from './columns';
import { DataTable } from '../medicines/data-table';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        const permissionError = new FirestorePermissionError({
          path: ordersRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Manage Orders</h1>
      </div>
      <DataTable columns={columns} data={orders} filterColumn="id" filterPlaceholder="Filter by Order ID..." />
    </div>
  );
}
