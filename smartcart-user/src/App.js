import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StoreActivationPage from "./pages/StoreActivationPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import InvoicePage from "./pages/InvoicePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import { auth } from "./firebase";
import "./index.css";

const ACTIVE_STORE_KEY = "smartcart.activeStore";
const getActiveStore = () => {
  try { return JSON.parse(localStorage.getItem(ACTIVE_STORE_KEY) || "null"); }
  catch { return null; }
};

function AppLoading() {
  return <main className="app-loading" aria-label="Loading your account"><div className="loading-brand"><span className="skeleton loading-mark"/><span className="skeleton loading-brand-name"/></div><section className="loading-card"><span className="skeleton loading-kicker"/><span className="skeleton loading-title"/><span className="skeleton loading-copy"/><span className="skeleton loading-copy short"/><div className="loading-fields"><span className="skeleton loading-field"/><span className="skeleton loading-field"/><span className="skeleton loading-button"/></div></section></main>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [store, setStore] = useState(getActiveStore);
  useEffect(() => auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser); setCartItems([]);
    // Existing per-user activations are migrated once to the shared device setup.
    if (currentUser && !getActiveStore()) {
      const saved = localStorage.getItem(`smartcart.store.${currentUser.uid}`);
      if (saved) { localStorage.setItem(ACTIVE_STORE_KEY, saved); setStore(JSON.parse(saved)); }
    }
    setAuthReady(true);
  }), []);
  const activateStore = (selectedStore) => { localStorage.setItem(ACTIVE_STORE_KEY, JSON.stringify(selectedStore)); setStore(selectedStore); };
  const signOut = async () => { setCartItems([]); await auth.signOut(); };
  const protectedPage = (page) => user ? page : <Navigate to={store ? "/" : "/activate-store"} replace />;
  return <Router><Routes>{!authReady ? <Route path="*" element={<AppLoading/>}/> : <>
    <Route path="/" element={store ? (user ? <Navigate to="/cart" replace /> : <LoginPage onLoginSuccess={setUser} />) : <Navigate to="/activate-store" replace />} />
    <Route path="/activate-store" element={store ? <Navigate to="/" replace /> : <StoreActivationPage onActivated={activateStore} />} />
    <Route path="/cart" element={protectedPage(store ? <CartPage user={user} adminId={store.adminId} storeName={store.storeName} cartItems={cartItems} setCartItems={setCartItems} onSignOut={signOut} /> : <Navigate to="/activate-store" replace />)} />
    <Route path="/checkout" element={protectedPage(store ? <CheckoutPage adminId={store.adminId} clearCart={() => setCartItems([])} onComplete={() => setCartItems([])} /> : <Navigate to="/activate-store" replace />)} />
    <Route path="/orders" element={protectedPage(store ? <OrdersPage adminId={store.adminId} /> : <Navigate to="/activate-store" replace />)} />
    <Route path="/orders/:orderId" element={protectedPage(store ? <OrderDetailsPage adminId={store.adminId} /> : <Navigate to="/activate-store" replace />)} />
    <Route path="/invoice" element={<InvoicePage />} /><Route path="*" element={<Navigate to="/" replace />} />
  </>}</Routes></Router>;
}
