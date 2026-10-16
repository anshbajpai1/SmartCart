// src/pages/Carts.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

function Carts() {
  const [cartNumber, setCartNumber] = useState('');
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCarts(currentUser.uid);
      } else {
        setCarts([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCarts = async (userId) => {
    setLoading(true);
    const cartsRef = collection(db, 'carts');
    const q = query(cartsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const userCarts = [];
    querySnapshot.forEach((doc) => {
      userCarts.push({ id: doc.id, ...doc.data() });
    });
    setCarts(userCarts);
    setLoading(false);
  };

  const handleAddCart = async (e) => {
    e.preventDefault();
    if (!cartNumber) {
      alert('Please enter cart number');
      return;
    }
    if (!user) {
      alert('Please login first');
      return;
    }

    try {
      if (editId) {
        const cartRef = doc(db, 'carts', editId);
        await updateDoc(cartRef, {
          cartNumber,
        });
        setEditId(null);
      } else {
        await addDoc(collection(db, 'carts'), {
          cartNumber,
          userId: user.uid,
          createdAt: new Date(),
        });
      }
      setCartNumber('');
      fetchCarts(user.uid);
    } catch (error) {
      console.error('Error adding/updating cart:', error);
      alert('Failed to add/update cart');
    }
  };

  const handleDeleteCart = async (id) => {
    if (window.confirm('Are you sure you want to delete this cart?')) {
      try {
        await deleteDoc(doc(db, 'carts', id));
        if (user) fetchCarts(user.uid);
      } catch (error) {
        console.error('Error deleting cart:', error);
        alert('Failed to delete cart');
      }
    }
  };

  const handleEditCart = (cart) => {
    setCartNumber(cart.cartNumber);
    setEditId(cart.id);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setCartNumber('');
  };

  return (
    <div>
      <h2>Manage Carts</h2>
      <form onSubmit={handleAddCart}>
        <input
          type="text"
          placeholder="Cart Number"
          value={cartNumber}
          onChange={(e) => setCartNumber(e.target.value)}
        />
        <button type="submit">{editId ? 'Update Cart' : 'Add Cart'}</button>
        {editId && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
      </form>

      <h3>Your Carts</h3>
      {loading ? (
        <p>Loading carts...</p>
      ) : carts.length === 0 ? (
        <p>No carts found.</p>
      ) : (
        <ul>
          {carts.map(({ id, cartNumber }) => (
            <li key={id} style={{ marginBottom: '10px' }}>
              Cart Number: {cartNumber}
              <button
                style={{ marginLeft: '10px' }}
                onClick={() => handleEditCart({ id, cartNumber })}
              >
                Edit
              </button>
              <button
                style={{ marginLeft: '10px', color: 'red' }}
                onClick={() => handleDeleteCart(id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Carts;
