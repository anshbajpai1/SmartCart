// src/components/ProductForm.js
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";

const ProductForm = ({ adminId }) => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    barcode: "",
    stock: "",
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId) {
      alert("Admin not logged in.");
      return;
    }

    try {
      // Save product under admins/{adminId}/inventory/{barcode}
      const productRef = doc(db, "admins", adminId, "inventory", product.barcode);
      await setDoc(productRef, {
        name: product.name,
        price: parseFloat(product.price),
        quantity: parseInt(product.stock),
        barcode: product.barcode,
      });

      setProduct({ name: "", price: "", barcode: "", stock: "" });
      alert("Product added to inventory!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
        required
      />
      <input
        name="price"
        type="number"
        placeholder="Price"
        value={product.price}
        onChange={handleChange}
        required
        step="0.01"
        min="0"
      />
      <input
        name="barcode"
        placeholder="Barcode"
        value={product.barcode}
        onChange={handleChange}
        required
      />
      <input
        name="stock"
        type="number"
        placeholder="Stock"
        value={product.stock}
        onChange={handleChange}
        required
        min="0"
      />
      <button type="submit">Add Product</button>
    </form>
  );
};

export default ProductForm;
