// firestore.ts
'use client';

import { Firestore, collection, addDoc, doc, setDoc, updateDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";

// Add a user document after registration
export async function createUserDoc(db: Firestore, uid: string, name: string, email: string) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    createdAt: serverTimestamp()
  });
}

// Add cart item for a user
export async function addCartItem(
  db: Firestore,
  userId: string,
  item: {
    medicineId: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
  }
) {
  if (!userId) throw new Error("User not logged in");

  const cartRef = collection(db, "users", userId, "cartItems");
  return await addDoc(cartRef, {
    medicineId: item.medicineId,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    createdAt: serverTimestamp(),
  });
}

// Create an order and clear the user's cart
export async function createOrder(
  db: Firestore,
  userId: string,
  orderData: {
    fullName: string;
    address: string;
    phone: string;
    paymentMethod: 'MPESA' | 'Cash on Delivery';
  },
  cartItems: { id?: string; medicineId: string; name: string; price: number; imageUrl: string; quantity: number }[]
): Promise<string> {
  if (!userId) throw new Error("User not logged in");

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderRef = await addDoc(collection(db, "orders"), {
    userId,
    items: cartItems.map(item => ({
      medicineId: item.medicineId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
    })),
    total,
    status: orderData.paymentMethod === 'MPESA' ? 'Paid' : 'Pending',
    shippingAddress: orderData.address,
    customerName: orderData.fullName,
    customerPhone: orderData.phone,
    paymentMethod: orderData.paymentMethod,
    createdAt: serverTimestamp(),
  });

  // Clear user's cart after order is placed
  const cartRef = collection(db, "users", userId, "cartItems");
  const cartSnapshot = await getDocs(cartRef);
  const deletePromises = cartSnapshot.docs.map(cartDoc => deleteDoc(cartDoc.ref));
  await Promise.all(deletePromises);

  return orderRef.id;
}

// Upload a prescription
export async function uploadPrescription(
  db: Firestore,
  userId: string,
  data: {
    patientName: string;
    email: string;
    prescriptionImageUrl: string;
    notes?: string;
  }
): Promise<string> {
  if (!userId) throw new Error("User not logged in");

  const prescriptionRef = await addDoc(collection(db, "prescriptions"), {
    userId,
    patientName: data.patientName,
    email: data.email,
    prescriptionImageUrl: data.prescriptionImageUrl,
    notes: data.notes || '',
    status: 'pending',
    uploadedAt: serverTimestamp(),
  });

  return prescriptionRef.id;
}

// Update prescription status (admin action)
export async function updatePrescriptionStatus(
  db: Firestore,
  prescriptionId: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string
): Promise<void> {
  const prescriptionRef = doc(db, "prescriptions", prescriptionId);
  await updateDoc(prescriptionRef, {
    status,
    reviewNotes: reviewNotes || '',
    reviewedAt: serverTimestamp(),
  });
}

// Get user orders
export async function getUserOrders(
  db: Firestore,
  userId: string
) {
  if (!userId) throw new Error("User not logged in");
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get user prescriptions
export async function getUserPrescriptions(
  db: Firestore,
  userId: string
) {
  if (!userId) throw new Error("User not logged in");
  const prescRef = collection(db, "prescriptions");
  const q = query(prescRef, where("userId", "==", userId), orderBy("uploadedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
