// src/pages/AddProduct.js
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    quantity: '',
    barcode: ''
  });
  const [products, setProducts] = useState([]);
  const [adminId, setAdminId] = useState(null);

  // Monitor auth and set adminId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminId(user.uid);
      } else {
        alert('You must be logged in as an admin!');
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  // Handle product save
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId) return alert('Admin not authenticated!');

    try {
      await setDoc(doc(db, `admins/${adminId}/inventory`, product.barcode), {
        name: product.name,
        quantity: parseInt(product.quantity),
        barcode: product.barcode
      });
      alert('✅ Product saved!');
      setProduct({ name: '', quantity: '', barcode: '' });
    } catch (error) {
      console.error('❌ Error saving product:', error);
      alert('Error saving product. See console for details.');
    }
  };

  // Fetch admin-specific products
  useEffect(() => {
    if (!adminId) return;

    const unsub = onSnapshot(
      collection(db, `admins/${adminId}/inventory`),
      (snapshot) => {
        const productsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsArray);
      }
    );

    return () => unsub(); // cleanup
  }, [adminId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={product.quantity}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="barcode"
          placeholder="Barcode Number"
          value={product.barcode}
          onChange={handleChange}
          required
        />
        <button type="submit">Save Product</button>
      </form>

      <h3>Product List</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="3">No products found.</td>
            </tr>
          ) : (
            products.map((prod) => (
              <tr key={prod.id}>
                <td>{prod.barcode}</td>
                <td>{prod.name}</td>
                <td>{prod.quantity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddProduct;
