const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = require("./smartcart3-80472-firebase-adminsdk-fbsvc-b20833d0ce.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
const db = admin.firestore();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ status: "ok", service: "SmartCart checkout API" }));

async function requireUser(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    const error = new Error("Sign in is required.");
    error.status = 401;
    throw error;
  }
  return admin.auth().verifyIdToken(authHeader.slice(7));
}

app.get("/admin/store-profile", async (req, res) => {
  try {
    const user = await requireUser(req);
    const ref = db.doc(`admins/${user.uid}`);
    const profile = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const currentProfile = snapshot.exists ? snapshot.data() : {};
      if (currentProfile.storePin) {
        transaction.set(db.doc(`storePins/${currentProfile.storePin}`), { adminId: user.uid }, { merge: true });
        return currentProfile;
      }
      let storePin;
      for (let attempts = 0; attempts < 20; attempts += 1) {
        const candidate = String(Math.floor(100000 + Math.random() * 900000));
        if (!(await transaction.get(db.doc(`storePins/${candidate}`))).exists) { storePin = candidate; break; }
      }
      if (!storePin) throw new Error("Could not reserve a Store PIN. Please try again.");
      const nextProfile = { ...currentProfile, storePin, storeName: currentProfile.storeName || user.name || "My SmartCart store", createdAt: currentProfile.createdAt || admin.firestore.FieldValue.serverTimestamp() };
      transaction.set(ref, nextProfile, { merge: true });
      transaction.set(db.doc(`storePins/${storePin}`), { adminId: user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      return nextProfile;
    });
    res.json({ storePin: profile.storePin, storeName: profile.storeName || "My SmartCart store" });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});

app.post("/stores/resolve", async (req, res) => {
  try {
    await requireUser(req);
    const storePin = String(req.body.storePin || "").trim();
    if (!/^\d{6}$/.test(storePin)) return res.status(400).json({ error: "Enter a valid 6-digit Store PIN." });
    const pinRecord = await db.doc(`storePins/${storePin}`).get();
    if (!pinRecord.exists) return res.status(404).json({ error: "No store matches this Store PIN." });
    const store = await db.doc(`admins/${pinRecord.data().adminId}`).get();
    if (!store.exists) return res.status(404).json({ error: "This store is no longer available." });
    res.json({ adminId: store.id, storeName: store.data().storeName || "SmartCart store" });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});

app.post("/checkout", async (req, res) => {
  try {
    await requireUser(req);

    const { adminId, name, phone, paymentMethod, cartItems } = req.body;
    if (!adminId || !name?.trim() || !/^\d{10}$/.test(phone || "") || !paymentMethod || !Array.isArray(cartItems) || !cartItems.length) {
      return res.status(400).json({ error: "Order details are incomplete or invalid." });
    }

    const orderId = await db.runTransaction(async (transaction) => {
      const inventoryRefs = cartItems.map((item) => db.doc(`admins/${adminId}/inventory/${item.id}`));
      const inventoryDocs = await Promise.all(inventoryRefs.map((ref) => transaction.get(ref)));
      let totalAmount = 0;

      inventoryDocs.forEach((snapshot, index) => {
        const item = cartItems[index];
        if (!snapshot.exists) throw new Error(`${item.productName || "Product"} is no longer available.`);
        const product = snapshot.data();
        const requestedQuantity = Number(item.quantity);
        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || product.quantity < requestedQuantity) {
          throw new Error(`Insufficient stock for ${product.productName || "this product"}.`);
        }
        totalAmount += Number(product.price) * requestedQuantity;
        transaction.update(inventoryRefs[index], {
          quantity: product.quantity - requestedQuantity,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      const orderRef = db.collection(`admins/${adminId}/orders`).doc();
      const order = {
        customerName: name.trim(), phone, paymentMethod, totalAmount,
        products: cartItems.map((item, index) => ({
          id: item.id, productName: inventoryDocs[index].data().productName,
          barcode: inventoryDocs[index].data().barcode,
          price: Number(inventoryDocs[index].data().price), quantity: Number(item.quantity),
        })),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(orderRef, order);
      transaction.set(db.collection(`admins/${adminId}/customerActivity`).doc(), { ...order, orderId: orderRef.id });
      return orderRef.id;
    });

    res.status(201).json({ message: "Order processed successfully.", orderId });
  } catch (error) {
    console.error("Checkout error:", error.message);
    res.status(400).json({ error: error.message || "Unable to process the order." });
  }
});

app.listen(PORT, () => console.log(`SmartCart API listening on port ${PORT}`));
