import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  const copyStoreCode = async () => {
    if (!user?.uid) return;
    try { await navigator.clipboard.writeText(user.uid); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  const logout = async () => { await signOut(auth); navigate("/"); };
  if (!user) return <main className="admin-main"><div className="page-skeleton">Loading account…</div></main>;
  return <main className="admin-main">
    <div className="page-heading"><div><p className="eyebrow">Store settings</p><h1>Account & store access</h1><p>Manage the permanent customer activation code for this store.</p></div></div>
    <section className="account-card store-code-card"><div><p className="section-label">Permanent Store Code</p><h2>Your store’s unique customer code</h2><p className="muted">This code never changes. Share it with a customer only when they activate this store for the first time.</p></div><div className="store-code-value" aria-label="Store code">{user.uid}</div><button className="button button-primary" onClick={copyStoreCode}>{copied ? "Copied" : "Copy Store Code"}</button></section>
    <section className="account-card"><p className="section-label">Administrator profile</p><div className="profile-row"><span>Name</span><strong>{user.displayName || "Store administrator"}</strong></div><div className="profile-row"><span>Email</span><strong>{user.email || "Not available"}</strong></div><div className="profile-row"><span>Store ID</span><strong>{user.uid}</strong></div><button className="button button-secondary" onClick={logout}>Sign out</button></section>
  </main>;
}
