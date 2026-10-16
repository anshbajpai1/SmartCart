import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import CustomerHeader from "../components/CustomerHeader";

export default function CheckoutPage({ adminId, clearCart, onComplete }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const items = state?.cartItems || [];
  const savedProfile = auth.currentUser ? JSON.parse(localStorage.getItem(`smartcart.profile.${auth.currentUser.uid}`) || "{}") : {};
  const [form, setForm] = useState({ name: auth.currentUser?.displayName || savedProfile.name || "", phone: savedProfile.phone || "", paymentMethod: "UPI" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!items.length) return <main className="customer-main"><div className="customer-panel empty-cart">There is nothing to check out.<br /><button className="button button-primary" style={{ marginTop: 16 }} onClick={() => navigate("/cart")}>Return to basket</button></div></main>;
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) return setError("Enter a valid 10-digit mobile number.");
    setSaving(true); setError("");
    try {
      const isCash = form.paymentMethod === "Cash";
      const cashCode = isCash ? String(Math.floor(10000000 + Math.random() * 90000000)) : null;
      const order = { customerId: auth.currentUser?.uid || "", customerEmail: auth.currentUser?.email || "", customerName: form.name.trim(), phone: form.phone, paymentMethod: form.paymentMethod, cartItems: items, totalAmount: total, status: isCash ? "awaiting_cash" : "completed", paymentStatus: isCash ? "pending" : "paid", cashCode, createdAt: serverTimestamp() };
      const orderRef = await addDoc(collection(db, "admins", adminId, "orders"), order);
      await addDoc(collection(db, "admins", adminId, "customerActivity"), { ...order, orderId: orderRef.id, activityType: "checkout" });
      clearCart();
      await onComplete();
      navigate(`/orders/${orderRef.id}`);
    } catch (requestError) { setError(requestError.message || "Unable to record this order. Please try again."); }
    finally { setSaving(false); }
  };
  return <div className="customer-shell"><CustomerHeader/><main className="customer-main"><div className="page-intro"><div><p className="section-label">Final step</p><h1 className="customer-title">Checkout</h1><p className="customer-subtitle">Confirm your details and preferred payment method.</p></div><button className="button button-secondary" onClick={() => navigate("/cart")}>Back to basket</button></div><div className="checkout-grid"><form className="customer-panel checkout-form" onSubmit={submit}><p className="section-label">Your details</p><h2>Complete your order</h2><div className="field"><label htmlFor="name">Full name</label><input className="form-input" id="name" name="name" value={form.name} onChange={change} required placeholder="Customer name" /></div><div className="field"><label htmlFor="phone">Mobile number</label><input className="form-input" id="phone" name="phone" value={form.phone} onChange={change} inputMode="numeric" maxLength="10" required placeholder="10-digit number" /></div><div className="field"><label htmlFor="payment">Payment method</label><select className="form-input" id="payment" name="paymentMethod" value={form.paymentMethod} onChange={change}><option>UPI</option><option>Cash</option><option>Card</option></select></div>{error && <p className="feedback">{error}</p>}<button className="button button-primary" disabled={saving}>{saving ? "Placing order…" : "Confirm and place order"}</button></form><aside className="customer-panel order-summary"><p className="section-label">Review</p><h2>Your order</h2>{items.map((item) => <div className="order-item" key={item.id}><div><strong>{item.productName}</strong><small>{item.quantity} × ₹{item.price.toFixed(2)}</small></div><strong>₹{(item.quantity * item.price).toFixed(2)}</strong></div>)}<div className="summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div></aside></div></main></div>;
}
