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
  return <main className="admin-main account-page">
    <div className="page-heading"><div><p className="eyebrow">Store settings</p><h1>Account & store access</h1><p>Keep your store identity and customer activation details in one place.</p></div></div>
    <div className="account-layout">
      <section className="account-card store-code-card"><div className="account-card-heading"><div className="account-icon">SC</div><div><p className="section-label">Permanent Store Code</p><h2>One code for this store</h2></div></div><p className="account-description">Share this code with the owner setting up a SmartCart device. Once connected, every customer on that device sees this store automatically.</p><div className="store-code-box"><span>Store code</span><code>{user.uid}</code></div><button className="button button-primary account-copy-button" onClick={copyStoreCode}>{copied ? "Store Code Copied" : "Copy Store Code"}</button></section>
      <section className="account-card account-profile-card"><div className="account-card-heading"><div className="profile-initial">{(user.displayName || user.email || "S").charAt(0).toUpperCase()}</div><div><p className="section-label">Administrator</p><h2>{user.displayName || "Store administrator"}</h2></div></div><div className="account-details"><div><span>Email address</span><strong>{user.email || "Not available"}</strong></div><div><span>Account ID</span><strong>{user.uid}</strong></div></div><div className="account-actions"><button className="button button-secondary" onClick={logout}>Sign out of admin</button></div></section>
    </div>
  </main>;
}
