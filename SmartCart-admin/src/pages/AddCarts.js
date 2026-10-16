// src/pages/AddCarts.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';

function AddCarts() {
  const [cartNumber, setCartNumber] = useState('');
  const [carts, setCarts] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'carts'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cartsData = [];
      querySnapshot.forEach((doc) => {
        cartsData.push({ id: doc.id, ...doc.data() });
      });
      setCarts(cartsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCart = async (e) => {
    e.preventDefault();

    if (!cartNumber.trim()) {
      alert('Please enter a cart number');
      return;
    }

    try {
      await addDoc(collection(db, 'carts'), {
        cartNumber: cartNumber.trim(),
        userId: user.uid,
        createdAt: new Date(),
      });
      setCartNumber('');
    } catch (error) {
      console.error('Error adding cart:', error);
      alert('Failed to add cart');
    }
  };

  const handleDeleteCart = async (id) => {
    if (window.confirm('Are you sure you want to delete this cart?')) {
      try {
        await deleteDoc(doc(db, 'carts', id));
      } catch (error) {
        console.error('Error deleting cart:', error);
        alert('Failed to delete cart');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Manage Carts</h2>

      <form onSubmit={handleAddCart} style={styles.form}>
        <input
          type="text"
          placeholder="Enter Cart Number"
          value={cartNumber}
          onChange={(e) => setCartNumber(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          Add Cart
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Your Carts</h3>
      {carts.length === 0 && <p>No carts added yet.</p>}

      <ul style={styles.list}>
        {carts.map((cart) => (
          <li key={cart.id} style={styles.listItem}>
            <span>Cart Number: {cart.cartNumber}</span>
            <button
              onClick={() => handleDeleteCart(cart.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: 'auto',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    flex: '1 1 250px',
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  addButton: {
    padding: '10px 18px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 16,
    transition: 'background-color 0.3s',
  },
  list: {
    listStyle: 'none',
    paddingLeft: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: '10px 15px',
    borderRadius: 4,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    border: 'none',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

export default AddCarts;
