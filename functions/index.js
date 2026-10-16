const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

async function requireUser(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    const error = new Error("Sign in is required."); error.status = 401; throw error;
  }
  return admin.auth().verifyIdToken(authHeader.slice(7));
}

async function storeProfile(user) {
  const ref = db.doc(`admins/${user.uid}`);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? snapshot.data() : {};
    if (current.storePin) {
      transaction.set(db.doc(`storePins/${current.storePin}`), { adminId: user.uid }, { merge: true });
      return current;
    }
    let pin;
    for (let tries = 0; tries < 20; tries += 1) {
      const candidate = String(Math.floor(100000 + Math.random() * 900000));
      if (!(await transaction.get(db.doc(`storePins/${candidate}`))).exists) { pin = candidate; break; }
    }
    if (!pin) throw new Error("Could not reserve a Store PIN. Please try again.");
    const next = { ...current, storePin: pin, storeName: current.storeName || user.name || "My SmartCart store", createdAt: current.createdAt || admin.firestore.FieldValue.serverTimestamp() };
    transaction.set(ref, next, { merge: true });
    transaction.set(db.doc(`storePins/${pin}`), { adminId: user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return next;
  });
}

exports.api = onRequest({ region: "asia-south1" }, (req, res) => cors(req, res, async () => {
  try {
    const path = req.path.replace(/\/+$/, "") || "/";
    if (req.method === "GET" && path === "/") return res.json({ status: "ok" });
    if (req.method === "GET" && path === "/admin/store-profile") {
      const user = await requireUser(req); const store = await storeProfile(user);
      return res.json({ storePin: store.storePin, storeName: store.storeName || "My SmartCart store" });
    }
    if (req.method === "POST" && path === "/stores/resolve") {
      await requireUser(req); const pin = String(req.body.storePin || "").trim();
      if (!/^\d{6}$/.test(pin)) return res.status(400).json({ error: "Enter a valid 6-digit Store PIN." });
      const pinDoc = await db.doc(`storePins/${pin}`).get();
      if (!pinDoc.exists) return res.status(404).json({ error: "No store matches this Store PIN." });
      const store = await db.doc(`admins/${pinDoc.data().adminId}`).get();
      return store.exists ? res.json({ adminId: store.id, storeName: store.data().storeName || "SmartCart store" }) : res.status(404).json({ error: "This store is unavailable." });
    }
    if (req.method === "POST" && path === "/checkout") {
      await requireUser(req);
      const { adminId, name, phone, paymentMethod, cartItems } = req.body;
      if (!adminId || !name?.trim() || !/^\d{10}$/.test(phone || "") || !paymentMethod || !Array.isArray(cartItems) || !cartItems.length) return res.status(400).json({ error: "Order details are incomplete or invalid." });
      const orderId = await db.runTransaction(async (transaction) => {
        const refs = cartItems.map((item) => db.doc(`admins/${adminId}/inventory/${item.id}`));
        const products = await Promise.all(refs.map((ref) => transaction.get(ref));
        let totalAmount = 0;
        products.forEach((product, index) => {
          const item = cartItems[index], data = product.data();
          if (!product.exists || !Number.isInteger(Number(item.quantity)) || data.quantity < Number(item.quantity)) throw new Error(`Insufficient stock for ${item.productName || "this product"}.`);
          totalAmount += Number(data.price) * Number(item.quantity);
          transaction.update(refs[index], { quantity: data.quantity - Number(item.quantity), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        });
        const orderRef = db.collection(`admins/${adminId}/orders`).doc();
        const order = { customerName: name.trim(), phone, paymentMethod, totalAmount, products: cartItems, timestamp: admin.firestore.FieldValue.serverTimestamp() };
        transaction.set(orderRef, order); transaction.set(db.collection(`admins/${adminId}/customerActivity`).doc(), { ...order, orderId: orderRef.id });
        return orderRef.id;
      });
      return res.status(201).json({ message: "Order processed successfully.", orderId });
    }
    return res.status(404).json({ error: "Route not found." });
  } catch (error) { logger.error(error); return res.status(error.status || 400).json({ error: error.message || "Request failed." }); }
}));
