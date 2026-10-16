import React, { useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase";

export default function StoreActivationPage({ user, onActivated, onSignOut }) {
  const [storeCode, setStoreCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const activate = async (event) => {
    event.preventDefault();
    const code = storeCode.trim();
    if (code.length < 20) return setError("Enter the complete Store Code provided by the store administrator.");
    setLoading(true); setError("");
    try { await getDocs(query(collection(db, "admins", code, "inventory"), limit(1))); onActivated({ adminId: code, storeName: "SmartCart store" }); }
    catch { setError("We could not find that store. Check the code and try again."); }
    finally { setLoading(false); }
  };
  return <div className="auth-shell"><main className="auth-card activation-card"><div className="brand-mark">SC</div><p className="eyebrow">One-time setup</p><h1>Activate your store</h1><p className="auth-copy">Signed in as {user?.email || "customer"}. Enter the permanent Store Code supplied by the store administrator. You will not need it again on this device.</p><form onSubmit={activate}><div className="field"><label htmlFor="store-code">Store Code</label><input className="form-input" id="store-code" value={storeCode} onChange={(event) => setStoreCode(event.target.value)} placeholder="Paste your store code" autoComplete="off" required /></div>{error && <p className="feedback">{error}</p>}<button className="button button-primary full-width" disabled={loading}>{loading ? "Verifying store…" : "Activate store"}</button></form><button className="text-button" onClick={onSignOut}>Use a different account</button></main></div>;
}
