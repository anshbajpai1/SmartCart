import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import CustomerHeader from "../components/CustomerHeader";

const formatDate = (value) => value?.toDate ? value.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Just now";

export default function OrdersPage({ adminId }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    if (!auth.currentUser || !adminId) return;
    return onSnapshot(query(collection(db, "admins", adminId, "orders"), where("customerId", "==", auth.currentUser.uid)), (snapshot) => setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))), () => setOrders([]));
  }, [adminId]);
  return <div className="customer-shell"><CustomerHeader/><main className="customer-main narrow-main"><div className="page-intro"><div><p className="section-label">Your account</p><h1 className="customer-title">Previous orders</h1><p className="customer-subtitle">View payment status and receipts for every order placed with this account.</p></div><Link className="button button-secondary" to="/cart">Continue shopping</Link></div><section className="customer-panel orders-panel">{!orders ? <div className="empty-cart">Loading your orders…</div> : orders.length ? orders.map((order) => <Link className="order-row" to={`/orders/${order.id}`} key={order.id}><div><strong>Order #{order.id.slice(-6).toUpperCase()}</strong><small>{formatDate(order.createdAt)} · {order.cartItems?.length || 0} item(s)</small></div><div className="order-row-right"><strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong><span className={`payment-status ${order.paymentStatus || "pending"}`}>{order.paymentStatus === "paid" ? "Paid" : "Cash payment pending"}</span></div></Link>) : <div className="empty-cart">You have not placed any orders yet.</div>}</section></main></div>;
}
