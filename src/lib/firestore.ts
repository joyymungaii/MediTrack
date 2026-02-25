'use client';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Firestore,
  getDoc,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore';
import type { CartItem, Order, Prescription, FollowUp } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const addCartItem = async (db: Firestore, userId: string, item: Omit<CartItem, 'id'>) => {
  if (!item.medicineId) {
    console.error('Medicine ID is missing');
    return;
  }
  const itemRef = doc(db, 'users', userId, 'cartItems', item.medicineId);

  getDoc(itemRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        updateDoc(itemRef, {
          quantity: increment(item.quantity),
        }).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'update',
            requestResourceData: { quantity: `increment(${item.quantity})` },
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      } else {
        setDoc(itemRef, item).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'create',
            requestResourceData: item,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      }
    })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: itemRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

export const createOrder = async (
  db: Firestore,
  userId: string,
  orderData: Omit<Order, 'id' | 'createdAt' | 'userId'>,
  cartItems: CartItem[]
) => {
  const batch = writeBatch(db);

  const orderRef = doc(collection(db, 'orders'));
  batch.set(orderRef, {
    ...orderData,
    userId: userId,
    createdAt: serverTimestamp(),
  });

  const cartRef = collection(db, 'users', userId, 'cartItems');

  try {
    const cartSnapshot = await getDocs(cartRef);
    cartSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return orderRef.id;
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
            path: cartRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    // Re-throw other errors
    throw serverError;
  }
};


export const uploadPrescription = async (db: Firestore, userId: string, data: Omit<Prescription, 'id' | 'userId' | 'uploadedAt' | 'status'>) => {
  const prescriptionData: Omit<Prescription, 'id'> = {
    ...data,
    userId,
    status: 'pending',
    uploadedAt: serverTimestamp(),
  };
  const prescriptionsRef = collection(db, 'prescriptions');
  addDoc(prescriptionsRef, prescriptionData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: prescriptionsRef.path,
      operation: 'create',
      requestResourceData: prescriptionData,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const updatePrescriptionStatus = async (db: Firestore, prescriptionId: string, status: 'approved' | 'rejected') => {
    const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
    updateDoc(prescriptionRef, { status }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: prescriptionRef.path,
            operation: 'update',
            requestResourceData: { status },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
};

export const sendFollowUpMessage = async (db: Firestore, data: Omit<FollowUp, 'id' | 'sentAt'>) => {
    const followUpData = {
        ...data,
        sentAt: serverTimestamp(),
    };
    const followUpsRef = collection(db, 'followUps');
    addDoc(followUpsRef, followUpData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: followUpsRef.path,
            operation: 'create',
            requestResourceData: followUpData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
};
