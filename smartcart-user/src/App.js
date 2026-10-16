import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StoreActivationPage from "./pages/StoreActivationPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import InvoicePage from "./pages/InvoicePage";
import { auth } from "./firebase";
import "./index.css";

const ACTIVE_STORE_KEY = "smartcart.activeStore";

export default function App() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [store, setStore] = useState(null);
  useEffect(() => auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser); setCartItems([]);
    if (currentUser) {
      // A store belongs to this device, not to an individual customer account.
      // Existing per-user activations are migrated once for a seamless upgrade.
      let saved = localStorage.getItem(ACTIVE_STORE_KEY);
      if (!saved) {
        saved = localStorage.getItem(`smartcart.store.${currentUser.uid}`);
        if (saved) localStorage.setItem(ACTIVE_STORE_KEY, saved);
      }
      setStore(saved ? JSON.parse(saved) : null);
    } else setStore(null);
  }), []);
  const activateStore = (selectedStore) => { localStorage.setItem(ACTIVE_STORE_KEY, JSON.stringify(selectedStore)); setStore(selectedStore); };
  const signOut = async () => { setCartItems([]); await auth.signOut(); };
  const protectedPage = (page) => user ? page : <Navigate to="/" replace />;
  return <Router><Routes>
    <Route path="/" element={user ? <Navigate to={store ? "/cart" : "/activate-store"} replace /> : <LoginPage onLoginSuccess={setUser} />} />
    <Route path="/activate-store" element={protectedPage(store ? <Navigate to="/cart" replace /> : <StoreActivationPage user={user} onActivated={activateStore} onSignOut={signOut} />)} />
    <Route path="/cart" element={protectedPage(store ? <CartPage user={user} adminId={store.adminId} storeName={store.storeName} cartItems={cartItems} setCartItems={setCartItems} onSignOut={signOut} /> : <Navigate to="/activate-store" replace />)} />
    <Route path="/checkout" element={protectedPage(store ? <CheckoutPage adminId={store.adminId} clearCart={() => setCartItems([])} onComplete={signOut} /> : <Navigate to="/activate-store" replace />)} />
    <Route path="/invoice" element={<InvoicePage />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Router>;
}
