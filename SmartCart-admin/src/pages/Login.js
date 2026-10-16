// src/pages/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // redirect on success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={buttonStyle}>
            Login
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>
            Signup here
          </Link>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
};

const formWrapperStyle = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: '#f9f9f9',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  margin: '10px 0 20px 0',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default Login;
