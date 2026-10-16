import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (mode === "signup" && !/^\d{10}$/.test(form.phone)) return setError("Enter a valid 10-digit mobile number.");
    setLoading(true);
    try {
      const result = mode === "login" ? await signInWithEmailAndPassword(auth, form.email, form.password) : await createUserWithEmailAndPassword(auth, form.email, form.password);
      if (mode === "signup") { await updateProfile(result.user, { displayName: form.name.trim() }); localStorage.setItem(`smartcart.profile.${result.user.uid}`, JSON.stringify({ name: form.name.trim(), phone: form.phone })); }
      onLoginSuccess(result.user);
    } catch { setError(mode === "login" ? "Email or password is incorrect." : "We could not create this account. Try a different email."); }
    finally { setLoading(false); }
  };
  const toggleMode = () => { setMode(mode === "login" ? "signup" : "login"); setError(""); };
  return <div className="auth-shell"><main className="auth-card login-card"><div className="auth-brand"><span>SC</span><strong>SmartCart</strong></div><p className="section-label">Customer checkout</p><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="auth-copy">{mode === "login" ? "Sign in to scan products and checkout from this store." : "Your details are saved securely for a faster checkout."}</p><form onSubmit={submit}>{mode === "signup" && <><div className="field"><label htmlFor="name">Full name</label><input className="form-input" id="name" name="name" value={form.name} onChange={change} required placeholder="Your name" /></div><div className="field"><label htmlFor="phone">Mobile number</label><input className="form-input" id="phone" name="phone" value={form.phone} onChange={change} required inputMode="numeric" maxLength="10" placeholder="10-digit number" /></div></>}<div className="field"><label htmlFor="email">Email address</label><input className="form-input" id="email" name="email" type="email" value={form.email} onChange={change} required placeholder="you@example.com" /></div><div className="field"><label htmlFor="password">Password</label><input className="form-input" id="password" name="password" type="password" value={form.password} onChange={change} required minLength="6" placeholder="Minimum 6 characters" /></div>{error && <p className="feedback">{error}</p>}<button className="button button-primary full-width auth-submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form><div className="auth-divider"><span>or</span></div><button className="auth-switch" onClick={toggleMode}>{mode === "login" ? "New customer? Create an account" : "Already have an account? Sign in"}</button></main></div>;
}
