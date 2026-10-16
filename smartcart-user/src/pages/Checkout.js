import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

function Checkout() {
  const { cartId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [adminId, setAdminId] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const cartDoc = await getDoc(doc(db, 'carts', cartId));
        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          setCartItems(cartData.items || []);
          setAdminId(cartData.adminUID);
        } else {
          console.log('Cart not found');
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [cartId]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ✅ Step 1: Update Inventory Function
  const updateInventoryAfterCheckout = async (items) => {
    for (const item of items) {
      try {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const currentQty = productSnap.data().quantity || 0;
          const newQty = currentQty - item.quantity;

          if (newQty >= 0) {
            await updateDoc(productRef, { quantity: newQty });
            console.log(`✅ Updated quantity for ${item.name}: ${newQty}`);
          } else {
            console.warn(`⚠️ Not enough stock for ${item.name}`);
          }
        } else {
          console.error(`❌ Product ${item.productId} not found`);
        }
      } catch (err) {
        console.error('Error updating inventory:', err);
      }
    }
  };

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to place an order.');
      return;
    }

    if (!customerName || !phone) {
      alert('Please enter customer name and phone number');
      return;
    }

    const activityRef = collection(db, 'admins', adminId, 'customerActivity');

    const activityData = {
      adminUid: adminId,
      cartId,
      customerName,
      phone,
      items: cartItems,
      total: calculateTotal(),
      timestamp: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(activityRef, activityData);

      // ✅ Step 2: Call inventory update after successful order
      await updateInventoryAfterCheckout(cartItems);

      alert('✅ Order placed successfully!');
      navigate(`/invoice/${adminId}/${docRef.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Failed to complete checkout. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>Checkout Summary</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={styles.itemList}>
            {cartItems.map((item, index) => (
              <li key={index} style={styles.item}>
                <strong>{item.name}</strong> — ₹{item.price} × {item.quantity}
              </li>
            ))}
          </ul>
          <h3>Total: ₹{calculateTotal()}</h3>
          <button onClick={handleCheckout} style={styles.checkoutButton}>
            Place Order & Generate Invoice
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemList: {
    listStyleType: 'none',
    padding: 0,
  },
  item: {
    marginBottom: '10px',
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  checkoutButton: {
    marginTop: '20px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Checkout;
