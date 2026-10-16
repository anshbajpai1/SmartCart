import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import "./AdminPages.css";

const date = (value) => value?.toDate ? value.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Just now";

export default function CustomerActivity() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState(null);
  const [cashCode, setCashCode] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState(false);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) { setOrders([]); return; }
    return onSnapshot(query(collection(db, "admins", user.uid, "customerActivity"), orderBy("createdAt", "desc")), (snapshot) => setOrders(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))));
  }, [user]);
  const confirmCash = async (event) => {
    event.preventDefault();
    if (!user || !/^\d{8}$/.test(cashCode)) return setNotice("Scan or enter the 8-digit cash payment code.");
    setConfirming(true); setNotice("");
    try {
      const match = await getDocs(query(collection(db, "admins", user.uid, "customerActivity"), where("cashCode", "==", cashCode)));
      if (match.empty) throw new Error("No pending cash order was found for this code.");
      const activity = match.docs[0];
      const data = activity.data();
      if (data.paymentStatus !== "pending") throw new Error("This cash payment has already been confirmed.");
      const update = { paymentStatus: "paid", status: "completed", cashCollectedAt: serverTimestamp() };
      await Promise.all([updateDoc(activity.ref, update), updateDoc(doc(db, "admins", user.uid, "orders", data.orderId), update)]);
      setCashCode(""); setNotice(`Cash payment confirmed for ${data.customerName || "customer"}. The invoice is now available.`);
    } catch (error) { setNotice(error.message || "Could not confirm this cash payment."); }
    finally { setConfirming(false); }
  };
  return <><div className="page-header"><div><p className="eyebrow">Customer transactions</p><h1 className="page-title">Order activity</h1><p className="page-subtitle">Review orders and confirm cash payments from one secure register.</p></div></div><section className="panel cash-confirm-panel"><div><p className="section-label">Cash counter</p><h2>Scan cash payment barcode</h2><p>Scan the customer’s generated barcode after collecting cash to release their invoice.</p></div><form onSubmit={confirmCash}><input className="search-input" aria-label="Cash payment code" value={cashCode} onChange={(event) => setCashCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="8-digit payment code" inputMode="numeric" /><button className="button button-primary" disabled={confirming}>{confirming ? "Confirming…" : "Confirm payment"}</button></form>{notice && <p className="cash-notice">{notice}</p>}</section><section className="panel">{!orders ? <div className="load-rows">{[1,2,3,4,5].map((i) => <div className="skeleton load-row" key={i}/>)}</div> : orders.length ? <div style={{ overflowX: "auto" }}><table className="data-table"><thead><tr><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Placed</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.customerName || "Walk-in customer"}</strong><br/><span className="table-muted">{order.phone || "No phone"}</span></td><td>{order.cartItems?.map((item) => `${item.productName} × ${item.quantity}`).join(", ") || "—"}</td><td><span className={`status ${order.paymentStatus === "pending" ? "status-pending" : ""}`}>{order.paymentStatus === "pending" ? "Cash pending" : `${order.paymentMethod || "Payment"} paid`}</span></td><td>₹{Number(order.totalAmount || 0).toFixed(2)}</td><td>{date(order.createdAt)}</td></tr>)}</tbody></table></div> : <div className="empty-state">Customer orders will appear here after the first checkout.</div>}</section></>;
}
