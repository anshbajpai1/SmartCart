import React from "react";

const ThankYouPage = ({ onBackToHome }) => {
  return (
    <>
      <div className="thankyou-container">
        <div className="thankyou-card">
          <h2>Thank You!</h2>
          <p>Your purchase has been confirmed successfully.</p>
          <button onClick={onBackToHome}>Back to Home</button>
        </div>
      </div>

      <style>{`
        body, html, #root {
          height: 100%;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #ffffff;
          color: #222;
        }

        .thankyou-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          padding: 20px;
          text-align: center;
        }

        .thankyou-card {
          background: #f9f9f9;
          padding: 40px 50px;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          max-width: 400px;
          width: 100%;
        }

        .thankyou-card h2 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: #1a237e;
        }

        .thankyou-card p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          color: #444;
        }

        button {
          padding: 14px 30px;
          font-size: 1.1rem;
          font-weight: 700;
          background: #3949ab;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          box-shadow: 0 6px 10px #3949ab99;
        }

        button:hover {
          background: #1a237e;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px #1a237eaa;
        }
      `}</style>
    </>
  );
};

export default ThankYouPage;
