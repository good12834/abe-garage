import React, { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaPaypal,
  FaApplePay,
  FaGooglePay,
  FaMoneyBillWave,
  FaShieldAlt,
  FaLock,
  FaCheck,
  FaTimes,
  FaDownload,
  FaReceipt,
  FaPercent,
  FaGift,
} from "react-icons/fa";

const PaymentIntegration = ({
  serviceInfo,
  customerInfo,
  onPaymentComplete,
  onClose,
  isOpen,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentStatus, setPaymentStatus] = useState("form");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: customerInfo?.email || "",
    phone: customerInfo?.phone || "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [availableDiscounts] = useState([
    { code: "FIRST10", discount: 10, description: "10% off first service" },
    {
      code: "LOYAL20",
      discount: 20,
      description: "20% off for loyal customers",
    },
    {
      code: "SEASONAL15",
      discount: 15,
      description: "15% off seasonal service",
    },
  ]);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");

  useEffect(() => {
    if (isOpen) {
      calculateTotals();
    }
  }, [serviceInfo, discount, tip]);

  const calculateTotals = () => {
    const subtotal = serviceInfo?.total || 0;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const tipAmount = tip || (customTip ? parseFloat(customTip) : 0);
    const tax = (afterDiscount + tipAmount) * 0.08; // 8% tax
    const total = afterDiscount + tipAmount + tax;

    return {
      subtotal,
      discountAmount,
      afterDiscount,
      tipAmount,
      tax,
      total: Math.round(total * 100) / 100,
    };
  };

  const totals = calculateTotals();

  const handleDiscountApply = () => {
    const foundDiscount = availableDiscounts.find(
      (d) => d.code.toLowerCase() === discountCode.toLowerCase()
    );
    if (foundDiscount) {
      setDiscount(foundDiscount.discount);
      setDiscountCode("");
    } else {
      alert("Invalid discount code");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock payment success
      const paymentResult = {
        id: "PAY_" + Date.now(),
        status: "completed",
        method: paymentMethod,
        amount: totals.total,
        timestamp: new Date(),
        transactionId: "TXN_" + Math.random().toString(36).substr(2, 9),
        receipt: {
          customerName: customerInfo.name,
          serviceDate: new Date().toLocaleDateString(),
          services: serviceInfo.services,
          subtotal: totals.subtotal,
          discount: totals.discountAmount,
          tip: totals.tipAmount,
          tax: totals.tax,
          total: totals.total,
        },
      };

      setPaymentStatus("success");
      if (onPaymentComplete) {
        onPaymentComplete(paymentResult);
      }
    } catch (error) {
      setPaymentStatus("error");
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => (
    <div className="payment-form">
      <div className="service-summary">
        <h3>Service Summary</h3>
        <div className="summary-items">
          {serviceInfo?.services?.map((service, idx) => (
            <div key={idx} className="summary-item">
              <span>{service.name}</span>
              <span>${service.price}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Subtotal</span>
            <span>${totals.subtotal}</span>
          </div>
        </div>
      </div>

      <div className="discount-section">
        <h4>Discount Code</h4>
        <div className="discount-input">
          <input
            type="text"
            placeholder="Enter discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <button onClick={handleDiscountApply}>Apply</button>
        </div>
        {discount > 0 && (
          <div className="discount-applied">
            <FaCheck /> {discount}% discount applied
            <button onClick={() => setDiscount(0)}>Remove</button>
          </div>
        )}
      </div>

      <div className="tip-section">
        <h4>Add Tip</h4>
        <div className="tip-options">
          {[10, 15, 20].map((percent) => (
            <button
              key={percent}
              className={`tip-btn ${tip === percent ? "active" : ""}`}
              onClick={() => {
                setTip(percent);
                setCustomTip("");
              }}
            >
              {percent}%
            </button>
          ))}
        </div>
        <div className="custom-tip">
          <input
            type="number"
            placeholder="Custom tip amount"
            value={customTip}
            onChange={(e) => {
              setCustomTip(e.target.value);
              setTip(0);
            }}
          />
        </div>
      </div>

      <div className="payment-methods">
        <h4>Payment Method</h4>
        <div className="method-options">
          <button
            className={`method-btn ${paymentMethod === "card" ? "active" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            <FaCreditCard />
            Credit Card
          </button>
          <button
            className={`method-btn ${
              paymentMethod === "paypal" ? "active" : ""
            }`}
            onClick={() => setPaymentMethod("paypal")}
          >
            <FaPaypal />
            PayPal
          </button>
          <button
            className={`method-btn ${
              paymentMethod === "apple" ? "active" : ""
            }`}
            onClick={() => setPaymentMethod("apple")}
          >
            <FaApplePay />
            Apple Pay
          </button>
          <button
            className={`method-btn ${
              paymentMethod === "google" ? "active" : ""
            }`}
            onClick={() => setPaymentMethod("google")}
          >
            <FaGooglePay />
            Google Pay
          </button>
        </div>
      </div>

      {paymentMethod === "card" && (
        <div className="card-details">
          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={(e) =>
                setPaymentData({ ...paymentData, cardNumber: e.target.value })
              }
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={paymentData.expiryDate}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, expiryDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                placeholder="123"
                value={paymentData.cvv}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, cvv: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={paymentData.cardholderName}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  cardholderName: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      <div className="contact-info">
        <h4>Contact Information</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={paymentData.email}
              onChange={(e) =>
                setPaymentData({ ...paymentData, email: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={paymentData.phone}
              onChange={(e) =>
                setPaymentData({ ...paymentData, phone: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="payment-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${totals.subtotal}</span>
        </div>
        {totals.discountAmount > 0 && (
          <div className="summary-row discount">
            <span>Discount ({discount}%):</span>
            <span>-${totals.discountAmount}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Tip:</span>
          <span>${totals.tipAmount}</span>
        </div>
        <div className="summary-row">
          <span>Tax:</span>
          <span>${totals.tax}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${totals.total}</span>
        </div>
      </div>

      <div className="security-info">
        <FaShieldAlt />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      <button
        className="pay-btn"
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="spinner"></div>
            Processing...
          </>
        ) : (
          <>
            <FaLock />
            Pay ${totals.total}
          </>
        )}
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="payment-success">
      <div className="success-icon">
        <FaCheck />
      </div>
      <h3>Payment Successful!</h3>
      <p>Your payment has been processed successfully.</p>

      <div className="receipt-info">
        <div className="receipt-item">
          <span>Transaction ID:</span>
          <span>TXN_{Math.random().toString(36).substr(2, 9)}</span>
        </div>
        <div className="receipt-item">
          <span>Amount Paid:</span>
          <span>${totals.total}</span>
        </div>
        <div className="receipt-item">
          <span>Date:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="success-actions">
        <button className="receipt-btn">
          <FaDownload />
          Download Receipt
        </button>
        <button className="email-btn">
          <FaReceipt />
          Email Receipt
        </button>
      </div>

      <button className="continue-btn" onClick={onClose}>
        Continue
      </button>
    </div>
  );

  const renderError = () => (
    <div className="payment-error">
      <div className="error-icon">
        <FaTimes />
      </div>
      <h3>Payment Failed</h3>
      <p>There was an issue processing your payment. Please try again.</p>

      <div className="error-actions">
        <button className="retry-btn" onClick={() => setPaymentStatus("form")}>
          Try Again
        </button>
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="payment-integration">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="payment-content">
          {paymentStatus === "form" && renderPaymentForm()}
          {paymentStatus === "success" && renderSuccess()}
          {paymentStatus === "error" && renderError()}
        </div>
      </div>
    </div>
  );
};

export default PaymentIntegration;
