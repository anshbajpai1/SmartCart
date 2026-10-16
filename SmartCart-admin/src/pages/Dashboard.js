import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import "./AdminPages.css";
import "./Dashboard.css";

const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(amount) || 0);
const dateValue = (value) => value?.toDate ? value.toDate() : value instanceof Date ? value : value?.seconds ? new Date(value.seconds * 1000) : null;
const formatDate = (value) => { const date = dateValue(value); return date ? date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable"; };
const isPaid = (order) => order.paymentStatus === "paid" || order.status === "completed";

export default function Dashboard() {
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setUid(user?.uid || "");
    setAuthReady(true);
  }, () => { setUid(""); setAuthReady(true); }), []);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!uid) { setProducts([]); setOrders([]); return undefined; }
    setProducts(null); setOrders(null); setError("");
    const unsubscribeInventory = onSnapshot(collection(db, "admins", uid, "inventory"), (snapshot) => {
      setProducts(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    }, () => { setProducts([]); setError("Inventory could not be loaded. Check your connection and admin access."); });
    const unsubscribeOrders = onSnapshot(collection(db, "admins", uid, "customerActivity"), (snapshot) => {
      setOrders(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })).sort((a, b) => (dateValue(b.createdAt || b.timestamp)?.getTime() || 0) - (dateValue(a.createdAt || a.timestamp)?.getTime() || 0)));
    }, () => { setOrders([]); setError("Order activity could not be loaded. Check your connection and Firestore access."); });
    return () => { unsubscribeInventory(); unsubscribeOrders(); };
  }, [authReady, uid]);

  const metrics = useMemo(() => {
    const safeProducts = products || [];
    const safeOrders = orders || [];
    const paidOrders = safeOrders.filter(isPaid);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const salesToday = paidOrders.filter((order) => { const date = dateValue(order.createdAt || order.timestamp); return date && date >= today; }).reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    return {
      productCount: safeProducts.length,
      units: safeProducts.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0),
      lowStock: safeProducts.filter((product) => Number(product.quantity) <= 5),
      sales: paidOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0),
      salesToday,
      paidCount: paidOrders.length,
      pendingCash: safeOrders.filter((order) => order.paymentMethod === "Cash" && order.paymentStatus === "pending").length,
      average: paidOrders.length ? paidOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0) / paidOrders.length : 0,
    };
  }, [products, orders]);

  const loading = !authReady || products === null || orders === null;
  if (loading) return <><div className="page-header"><div><p className="eyebrow">Store command center</p><h1 className="page-title">Store overview</h1><p className="page-subtitle">Your latest store activity is loading.</p></div></div><div className="metric-grid dashboard-metric-grid">{[1, 2, 3, 4].map((item) => <div className="panel dashboard-metric-skeleton" key={item}><span className="skeleton"/><span className="skeleton"/><span className="skeleton"/></div>)}</div><div className="dashboard-grid"><div className="panel dashboard-skeleton-panel"><span className="skeleton"/><span className="skeleton"/><span className="skeleton"/><span className="skeleton"/></div><div className="panel dashboard-skeleton-panel"><span className="skeleton"/><span className="skeleton"/><span className="skeleton"/></div></div></>;

  const recentOrders = (orders || []).slice(0, 6);
  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return <>
    <div className="page-header dashboard-page-header"><div><p className="eyebrow">Store command center</p><h1 className="page-title">Store overview</h1><p className="page-subtitle">A clear view of your inventory and customer activity.</p></div><div className="dashboard-header-actions"><span className="dashboard-date">{dateLabel}</span><Link className="button button-primary" to="/inventory">Manage inventory</Link></div></div>
    {error && <div className="dashboard-error" role="status"><strong>Some store data is unavailable.</strong><span>{error}</span></div>}
    {!uid && <div className="dashboard-error" role="status"><strong>Admin account required</strong><span>Sign in to view this store’s overview.</span><Link to="/login">Go to sign in</Link></div>}
    <section className="metric-grid dashboard-metric-grid">
      <Metric label="Products" value={metrics.productCount} note="Active catalogue" icon="box" tone="blue"/>
      <Metric label="Units in stock" value={metrics.units.toLocaleString("en-IN")} note="Across all products" icon="stock" tone="teal"/>
      <Metric label="Sales today" value={money(metrics.salesToday)} note={`${metrics.paidCount} completed orders`} icon="sales" tone="green"/>
      <Metric label="Cash pending" value={metrics.pendingCash} note={metrics.pendingCash ? "Needs counter confirmation" : "No pending cash orders"} icon="pending" tone={metrics.pendingCash ? "amber" : "slate"}/>
    </section>
    <div className="dashboard-grid dashboard-primary-grid">
      <section className="panel dashboard-panel"><div className="section-head"><div><h2>Recent orders</h2><span>Latest customer activity</span></div><Link to="/activity-log">View all orders</Link></div>{recentOrders.length ? <div className="recent-order-list">{recentOrders.map((order) => <Link className="recent-order" to="/activity-log" key={order.id}><span className="recent-order-icon">{(order.customerName || "C").charAt(0).toUpperCase()}</span><span className="recent-order-info"><strong>{order.customerName || "Customer"}</strong><small>{(order.cartItems || order.products || []).length} item(s) · {formatDate(order.createdAt || order.timestamp)}</small></span><span className="recent-order-total"><strong>{money(order.totalAmount)}</strong><small className={`dashboard-order-status ${isPaid(order) ? "paid" : "pending"}`}>{isPaid(order) ? "Paid" : order.paymentMethod === "Cash" ? "Cash pending" : "Awaiting payment"}</small></span></Link>)}</div> : <div className="dashboard-empty"><span className="dashboard-empty-icon">↗</span><strong>No orders yet</strong><p>Customer orders will appear here as soon as they are placed.</p></div>}</section>
      <section className="panel dashboard-panel"><div className="section-head"><div><h2>Inventory attention</h2><span>{metrics.lowStock.length ? `${metrics.lowStock.length} product(s) need review` : "Stock levels look healthy"}</span></div><Link to="/inventory">Inventory</Link></div>{metrics.lowStock.length ? <div className="stock-alert-list">{metrics.lowStock.slice(0, 6).map((product) => <div className="stock-alert" key={product.id}><span className="stock-alert-mark"/><span className="stock-alert-name"><strong>{product.productName || "Unnamed product"}</strong><small>Barcode {product.barcode || "not set"}</small></span><span className="stock-alert-count">{Number(product.quantity) || 0}<small>left</small></span></div>)}</div> : <div className="healthy-stock"><span>✓</span><strong>All products are stocked</strong><p>Products with 5 or fewer units will appear here.</p></div>}</section>
    </div>
    <div className="dashboard-bottom-grid"><section className="panel dashboard-stat-strip"><div><span className="stat-strip-label">Total sales recorded</span><strong>{money(metrics.sales)}</strong></div><div><span className="stat-strip-label">Average completed order</span><strong>{money(metrics.average)}</strong></div><div><span className="stat-strip-label">Low stock products</span><strong>{metrics.lowStock.length}</strong></div></section><section className="panel dashboard-quick-panel"><div className="section-head"><div><h2>Quick actions</h2><span>Common store tasks</span></div></div><div className="dashboard-quick-actions"><Link to="/inventory">Add a product <span>→</span></Link><Link to="/activity-log">Review cash payments <span>→</span></Link><Link to="/account">Store account <span>→</span></Link></div></section></div>
  </>;
}

function Metric({ label, value, note, icon, tone }) {
  return <article className="panel metric dashboard-metric"><span className={`metric-icon ${tone}`} aria-hidden="true">{icon === "box" ? "▣" : icon === "stock" ? "▤" : icon === "sales" ? "₹" : "◷"}</span><div className="dashboard-metric-copy"><p className="metric-label">{label}</p><strong className="metric-value">{value}</strong><div className="metric-note">{note}</div></div></article>;
}
