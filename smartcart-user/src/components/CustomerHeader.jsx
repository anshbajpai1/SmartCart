import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function CustomerHeader() {
  const navigate = useNavigate();
  const name = auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Customer";
  const signOut = async () => { await auth.signOut(); navigate("/"); };
  return <header className="customer-topbar"><Link className="customer-brand" to="/cart"><span>SC</span><strong>SmartCart</strong></Link><nav className="customer-nav" aria-label="Customer navigation"><NavLink to="/cart">Shop</NavLink><NavLink to="/orders">My orders</NavLink></nav><div className="customer-account"><div className="customer-avatar">{name.charAt(0).toUpperCase()}</div><span>{name}</span><button className="header-signout" onClick={signOut}>Sign out</button></div></header>;
}
