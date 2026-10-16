// src/Dashboard.js
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

function Dashboard() {
  const [adminData, setAdminData] = useState(null);
  const [cartId, setCartId] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      const ref = doc(db, "admins", auth.currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setAdminData(snap.data());
    };
    fetchAdmin();
  }, []);

  const addCart = async () => {
    const ref = doc(db, "admins", auth.currentUser.uid);
    await updateDoc(ref, {
      carts: arrayUnion(cartId)
    });
    setCartId("");
    const snap = await getDoc(ref);
    setAdminData(snap.data());
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome Admin</h2>
      <p>Phone: {adminData?.phone}</p>
      <h3>Your Cart IDs</h3>
      <ul>
        {adminData?.carts?.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
      <input placeholder="New Cart ID" value={cartId} onChange={(e) => setCartId(e.target.value)} />
      <button onClick={addCart}>Add Cart</button>
    </div>
  );
}

export default Dashboard;
