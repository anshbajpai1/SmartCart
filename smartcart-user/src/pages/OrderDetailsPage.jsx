import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import CashBarcode from "../components/CashBarcode";

export default function OrderDetailsPage({ adminId }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!adminId || !orderId) return;
    return onSnapshot(doc(db, "admins", adminId, "orders", orderId), (snapshot) => { if (!snapshot.exists() || snapshot.data().customerId !== auth.currentUser?.uid) setError("This order is unavailable."); else setOrder({ id: snapshot.id, ...snapshot.data() }); }, () => setError("This order is unavailable."));
  }, [adminId, orderId]);
  if (error) return <main className="customer-main"><div className="customer-panel empty-cart">{error}</div></main>;
  if (!order) return <main className="customer-main"><div className="customer-panel empty-cart">Loading order details…</div></main>;
  const pendingCash = order.paymentMethod === "Cash" && order.paymentStatus !== "paid";
  return <div className="customer-shell"><header className="customer-topbar"><div className="customer-brand"><span>SC</span>SmartCart</div><Link className="button button-secondary" to="/orders">All orders</Link></header><main className="customer-main narrow-main"><p className="section-label">{pendingCash ? "Payment pending" : "Order complete"}</p><h1 className="customer-title">{pendingCash ? "Show this at the cash counter" : "Your invoice"}</h1><p className="customer-subtitle">{pendingCash ? "The cashier will scan the code and confirm payment." : "Payment has been confirmed. Keep this invoice for your records."}</p><section className="customer-panel receipt-panel">{pendingCash && <div className="cash-payment-card"><span className="payment-status pending">Cash payment pending</span><CashBarcode value={order.cashCode} /><p>Payment code: <strong>{order.cashCode}</strong></p><small>Do not close this page until the cashier confirms your payment.</small></div>}<div className="receipt-head"><div><strong>Order #{order.id.slice(-6).toUpperCase()}</strong><p>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Processing"}</p></div><div className="receipt-total">₹{Number(order.totalAmount || 0).toFixed(2)}</div></div><div className="receipt-items">{order.cartItems?.map((item) => <div className="order-item" key={item.id}><div><strong>{item.productName}</strong><small>{item.quantity} × ₹{Number(item.price).toFixed(2)}</small></div><strong>₹{(item.quantity * item.price).toFixed(2)}</strong></div>)}</div>{!pendingCash && <><div className="summary-total"><span>Amount paid</span><span>₹{Number(order.totalAmount || 0).toFixed(2)}</span></div><button className="button button-secondary" onClick={() => window.print()}>Print invoice</button></>}</section></main></div>;
}
