import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import CustomerActivity from "./pages/CustomerActivity";
import AccountPage from "./pages/AccountPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

export default function App() {
  return <Router><div className="admin-shell"><Sidebar /><main className="admin-content"><Routes>
    <Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} />
    <Route path="/" element={<Dashboard />} /><Route path="/inventory" element={<Inventory />} />
    <Route path="/activity-log" element={<CustomerActivity />} /><Route path="/account" element={<AccountPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main></div></Router>;
}
