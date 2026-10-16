import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function pushCustomerActivity(adminId, data) {
  const { name, phone, paymentMethod, totalAmount, cartItems } = data;

  try {
    await addDoc(collection(db, `admins/${adminId}/customerActivity`), {
      customerName: name,
      phone,
      paymentMethod,
      totalAmount,
      products: cartItems,
      timestamp: Timestamp.now(),
    });

    console.log("✅ Customer activity pushed to Firestore.");
  } catch (error) {
    console.error("❌ Error pushing customer activity:", error);
  }
}
