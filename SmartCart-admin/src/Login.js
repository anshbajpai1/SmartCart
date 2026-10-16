// src/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed. Check credentials.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
