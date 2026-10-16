import React from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 px-6">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-5xl mb-4 text-green-600">✅ Order Placed!</h1>
        <p className="mb-6 text-gray-700 text-lg">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
