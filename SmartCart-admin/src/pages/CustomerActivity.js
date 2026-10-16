import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
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
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) { setOrders([]); return; }
    return onSnapshot(query(collection(db, "admins", user.uid, "customerActivity"), orderBy("createdAt", "desc")), (snapshot) => setOrders(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }))));
  }, [user]);

  const confirmActivity = async (activity) => {
    const data = activity.data;
    if (data.paymentMethod !== "Cash" || data.paymentStatus !== "pending") throw new Error("This order is not awaiting a cash payment.");
    if (!data.orderId) throw new Error("This order is missing its invoice reference. Please check the order record.");
    const update = { paymentStatus: "paid", status: "completed", cashCollectedAt: serverTimestamp() };
    await Promise.all([
      updateDoc(doc(db, "admins", user.uid, "customerActivity", activity.id), update),
      updateDoc(doc(db, "admins", user.uid, "orders", data.orderId), update),
    ]);
    setNotice(`Cash payment confirmed for ${data.customerName || "customer"}. The invoice is now available.`);
  };

  const findCashOrder = async (event) => {
    event.preventDefault();
    const code = cashCode.trim();
    if (!user || !/^\d{8}$/.test(code)) { setNotice("Scan a barcode or enter its complete 8-digit payment code."); return; }
    setConfirming(true); setNotice("");
    try {
      const match = await getDocs(query(collection(db, "admins", user.uid, "customerActivity"), where("cashCode", "==", code)));
      if (match.empty) throw new Error("No order was found for this payment code.");
      const snapshot = match.docs[0];
      const data = snapshot.data();
      if (data.paymentMethod !== "Cash" || data.paymentStatus !== "pending") throw new Error("This cash order is already paid or is no longer pending.");
      setSelectedOrder({ id: snapshot.id, data });
      setCashCode("");
      setNotice("Order found. Review the details and confirm cash collection in the order window.");
    } catch (error) { setNotice(error.message || "Could not find this cash order."); }
    finally { setConfirming(false); }
  };

  const confirmSelected = async () => {
    if (!selectedOrder || confirming) return;
    setConfirming(true); setNotice("");
    try {
      await confirmActivity(selectedOrder);
      setSelectedOrder(null);
    } catch (error) { setNotice(error.message || "Could not confirm this cash payment."); }
    finally { setConfirming(false); }
  };

  const openOrder = (order) => setSelectedOrder(order);
  const closeModal = (event) => { if (!event || event.target === event.currentTarget) setSelectedOrder(null); };

  return <>
    <div className="page-header"><div><p className="eyebrow">Customer transactions</p><h1 className="page-title">Order activity</h1><p className="page-subtitle">Review order details and confirm cash payments at the counter.</p></div></div>
    <section className="panel cash-confirm-panel"><div><p className="section-label">Cash counter</p><h2>Scan or enter payment barcode</h2><p>Scan or type the 8-digit code to open its order. Confirm collection from the order details.</p></div><form onSubmit={findCashOrder}><input className="search-input" aria-label="Cash payment code" value={cashCode} onChange={(event) => setCashCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="8-digit payment code" inputMode="numeric" autoComplete="off"/><button className="button button-primary" disabled={confirming}>{confirming ? "Finding order…" : "View order"}</button></form>{notice && <p className="cash-notice" role="status">{notice}</p>}</section>
    <section className="panel">{!orders ? <div className="load-rows">{[1,2,3,4,5].map((i) => <div className="skeleton load-row" key={i}/>)}</div> : orders.length ? <div style={{ overflowX: "auto" }}><table className="data-table"><thead><tr><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Placed</th><th>Details</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} tabIndex={0} onClick={() => openOrder({ id: order.id, data: order })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openOrder({ id: order.id, data: order }); } }} className={`order-row-clickable ${order.paymentMethod === "Cash" && order.paymentStatus === "pending" ? "order-row-pending" : ""}`}><td><strong>{order.customerName || "Walk-in customer"}</strong><br/><span className="table-muted">{order.phone || "No phone"}</span></td><td>{order.cartItems?.map((item) => `${item.productName} × ${item.quantity}`).join(", ") || "—"}</td><td><span className={`status ${order.paymentStatus === "pending" ? "status-pending" : ""}`}>{order.paymentStatus === "pending" ? "Cash pending" : `${order.paymentMethod || "Payment"} paid`}</span></td><td>₹{Number(order.totalAmount || 0).toFixed(2)}</td><td>{date(order.createdAt)}</td><td><button className="action-text" onClick={(event) => { event.stopPropagation(); openOrder({ id: order.id, data: order }); }}>View details</button></td></tr>)}</tbody></table></div> : <div className="empty-state">Customer orders will appear here after the first checkout.</div>}</section>
    {selectedOrder && <div className="order-modal-backdrop" role="presentation" onMouseDown={closeModal}><section className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title" onMouseDown={(event) => event.stopPropagation()}><header className="order-modal-header"><div><p className="eyebrow">Order details</p><h2 id="order-modal-title">{selectedOrder.data.customerName || "Customer order"}</h2><p>{date(selectedOrder.data.createdAt)} · {selectedOrder.data.phone || "No phone number"}</p></div><button className="modal-close" onClick={() => setSelectedOrder(null)} aria-label="Close details">×</button></header><div className="order-modal-content"><div className="modal-detail-grid"><div><span>Email</span><strong>{selectedOrder.data.customerEmail || "Not provided"}</strong></div><div><span>Payment method</span><strong>{selectedOrder.data.paymentMethod || "Not provided"}</strong></div><div><span>Payment status</span><strong className={selectedOrder.data.paymentStatus === "pending" ? "modal-pending" : "modal-paid"}>{selectedOrder.data.paymentStatus === "pending" ? "Pending cash collection" : "Paid"}</strong></div><div><span>Order reference</span><strong>{selectedOrder.data.orderId || "Unavailable"}</strong></div></div><h3>Items purchased</h3><div className="modal-items">{selectedOrder.data.cartItems?.length ? selectedOrder.data.cartItems.map((item, index) => <div className="modal-item" key={`${item.id || item.productName}-${index}`}><div><strong>{item.productName}</strong><small>{item.quantity} × ₹{Number(item.price || 0).toFixed(2)}{item.barcode ? ` · ${item.barcode}` : ""}</small></div><strong>₹{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</strong></div>) : <p className="table-muted">No item details were saved for this order.</p>}</div><div className="modal-total"><span>Order total</span><strong>₹{Number(selectedOrder.data.totalAmount || 0).toFixed(2)}</strong></div>{selectedOrder.data.cashCode && <p className="modal-code">Cash code <strong>{selectedOrder.data.cashCode}</strong></p>}</div><footer className="order-modal-footer"><button className="button button-secondary" onClick={() => setSelectedOrder(null)}>Close</button>{selectedOrder.data.paymentMethod === "Cash" && selectedOrder.data.paymentStatus === "pending" && <button className="button button-primary" onClick={confirmSelected} disabled={confirming}>{confirming ? "Confirming…" : "Cash received · Confirm payment"}</button>}</footer></section></div>}
  </>;
}
