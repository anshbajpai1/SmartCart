import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Icon = ({name}) => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d={name === "grid" ? "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" : name === "box" ? "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5 12 12l9-4.5M12 12v9" : name === "activity" ? "M3 12h4l2-6 4 12 2-6h6" : "M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8"}/></svg>;
export default function Sidebar() {
  const [user,setUser]=useState(null); const navigate=useNavigate();
  useEffect(()=>onAuthStateChanged(auth,setUser),[]);
  const links=[['/','grid','Overview'],['/inventory','box','Inventory'],['/activity-log','activity','Orders'],['/account','user','Account']];
  return <aside className="sidebar"><NavLink to="/" className="brand"><span className="brand-mark">SC</span><span>SmartCart<small>OPERATIONS</small></span></NavLink>
    <nav className="side-nav">{links.map(([to,icon,label])=><NavLink end={to==='/'} key={to} to={to} className={({isActive})=>`side-link ${isActive?'active':''}`}><Icon name={icon}/>{label}</NavLink>)}</nav>
    <div className="sidebar-footer">{user ? <><div className="account-chip"><span className="avatar">{(user.displayName||user.email||'A').slice(0,1).toUpperCase()}</span><span><strong>{user.displayName||'Store admin'}</strong><small>{user.email}</small></span></div><button className="logout-link" onClick={async()=>{await signOut(auth);navigate('/login')}}>Sign out</button></> : <button className="button button-primary" onClick={()=>navigate('/login')}>Sign in</button>}</div>
  </aside>;
}
