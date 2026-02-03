'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { Prescription } from '@/lib/types';
import { columns } from './columns';
import { DataTable } from '../medicines/data-table';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ManagePrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prescriptionsRef = collection(db, 'prescriptions');
    const unsubscribe: Unsubscribe = onSnapshot(
      prescriptionsRef,
      (snapshot) => {
        const data: Prescription[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Prescription));
        setPrescriptions(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching prescriptions:', error);
        const permissionError = new FirestorePermissionError({
          path: prescriptionsRef.path,
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
        <h1 className="text-3xl font-bold font-headline">Prescription Verification</h1>
      </div>
      <DataTable columns={columns} data={prescriptions} filterColumn="patientName" filterPlaceholder="Filter by patient name..." />
    </div>
  );
}
