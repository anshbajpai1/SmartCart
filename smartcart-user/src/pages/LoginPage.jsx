import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (mode === "signup" && !/^\d{10}$/.test(form.phone)) return setError("Enter a valid 10-digit mobile number.");
    setLoading(true);
    try {
      const result = mode === "login" ? await signInWithEmailAndPassword(auth, form.email, form.password) : await createUserWithEmailAndPassword(auth, form.email, form.password);
      if (mode === "signup") { await updateProfile(result.user, { displayName: form.name.trim() }); localStorage.setItem(`smartcart.profile.${result.user.uid}`, JSON.stringify({ name: form.name.trim(), phone: form.phone })); }
      onLoginSuccess(result.user);
    } catch (err) { setError(mode === "login" ? "Email or password is incorrect." : "We could not create this account. Try a different email."); }
    finally { setLoading(false); }
  };
  return <main className="customer-main" style={{ maxWidth: 480, paddingTop: "10vh" }}><div className="customer-brand" style={{ justifyContent: "center", marginBottom: 24 }}><span>SC</span>SmartCart</div><section className="customer-panel checkout-form"><p className="section-label">Customer checkout</p><h1 className="customer-title" style={{ fontSize: 26, marginBottom: 8 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="customer-subtitle" style={{ marginBottom: 24 }}>{mode === "login" ? "Sign in to scan and shop from your selected store." : "Your details are saved for faster checkout."}</p><form onSubmit={submit}>{mode === "signup" && <><div className="field"><label>Full name</label><input className="form-input" name="name" value={form.name} onChange={change} required placeholder="Your name" /></div><div className="field"><label>Mobile number</label><input className="form-input" name="phone" value={form.phone} onChange={change} required inputMode="numeric" maxLength="10" placeholder="10-digit number" /></div></>}<div className="field"><label>Email address</label><input className="form-input" name="email" type="email" value={form.email} onChange={change} required placeholder="you@example.com" /></div><div className="field"><label>Password</label><input className="form-input" name="password" type="password" value={form.password} onChange={change} required minLength="6" placeholder="Minimum 6 characters" /></div>{error && <p className="feedback">{error}</p>}<button className="button button-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "New customer? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}
