// firestore.ts
'use client';

import { Firestore, collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

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