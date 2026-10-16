import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Icon = ({ name }) => {
  const paths = {
    shop: <><path d="M4 10h16v10H4z"/><path d="M2.5 10 4.6 4h14.8l2.1 6M8 14h3v6H8zM14 14h3"/></>,
    orders: <><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6M9 19h4"/></>,
    signout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/></>,
  };
  return <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

export default function CustomerHeader() {
  const navigate = useNavigate();
  const name = auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Customer";
  const signOut = async () => { await auth.signOut(); navigate("/"); };
  return <header className="customer-topbar customer-app-header"><div className="header-shell"><Link className="customer-brand" to="/cart"><span className="brand-symbol"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 8h3l2.4 12h11.2l2-8H13"/><circle cx="14" cy="25" r="1.7"/><circle cx="22" cy="25" r="1.7"/></svg></span><span className="brand-copy"><strong>SmartCart</strong><small>Customer portal</small></span></Link><nav className="customer-nav" aria-label="Customer navigation"><NavLink to="/cart"><Icon name="shop"/>Shop</NavLink><NavLink to="/orders"><Icon name="orders"/>My orders</NavLink></nav><div className="header-right"><div className="store-connected"><i/><span>Store connected</span></div><div className="account-block"><div className="customer-avatar">{name.charAt(0).toUpperCase()}</div><div><strong>{name}</strong><small>Customer account</small></div></div><button className="header-signout" onClick={signOut} aria-label="Sign out"><Icon name="signout"/><span>Sign out</span></button></div></div></header>;
}
