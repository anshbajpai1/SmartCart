// src/utils/cartCreation.js

import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new cart and links it to a specific admin by their UID.
 * @param {string} adminUID - The UID of the admin.
 * @returns {Promise<string>} - The generated cart ID.
 */
export async function createCart(adminUID) {
  try {
    const cartId = uuidv4(); // Generate unique cart ID

    // Store cart info under 'carts' collection
    await setDoc(doc(db, 'carts', cartId), {
      cartId,
      adminUID,
      createdAt: serverTimestamp()
    });

    console.log(`✅ Cart created with ID: ${cartId}`);
    return cartId;
  } catch (error) {
    console.error('❌ Failed to create cart:', error);
    throw error;
  }
}
