// src/pages/Signup.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>
        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            placeholder="Full Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Sign Up</button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.loginText}>
          Already have an account? <a href="/login" style={styles.link}>Login</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: '40px 30px',
    borderRadius: 8,
    backgroundColor: 'white',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  title: {
    marginBottom: 24,
    fontWeight: '700',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    height: 44,
    marginBottom: 16,
    padding: '0 12px',
    fontSize: 16,
    borderRadius: 6,
    border: '1px solid #ccc',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  button: {
    height: 44,
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    marginTop: 16,
    color: 'red',
    fontWeight: '600',
  },
  loginText: {
    marginTop: 24,
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  }
};

export default Signup;
