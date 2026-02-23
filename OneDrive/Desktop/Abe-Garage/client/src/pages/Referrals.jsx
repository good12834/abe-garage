import React, { useState, useEffect } from "react";
import { referralsAPI } from "../services/api";

const Referrals = () => {
  const [referralInfo, setReferralInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [useCodeEmail, setUseCodeEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      setLoading(true);
      const response = await referralsAPI.getMyReferrals();
      setReferralInfo(response.data);
    } catch (error) {
      console.error("Error fetching referral info:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const response = await referralsAPI.generateCode();
      setReferralCode(response.data.referral_code);
      setShowCodeModal(true);
      fetchReferralInfo();
    } catch (error) {
      console.error("Error generating code:", error);
      setError("Failed to generate referral code");
    }
  };

  const useReferralCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await referralsAPI.useCode(referralCode, useCodeEmail);
      setSuccess(
        "Referral code applied successfully! You and your friend will receive rewards.",
      );
      setUseCodeEmail("");
      setReferralCode("");
      setShowCodeModal(false);
      fetchReferralInfo();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to apply referral code");
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess("Code copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="referrals-page">
      <div className="page-header">
        <h1>🎁 Refer a Friend</h1>
        <p>Share the love and earn rewards!</p>
      </div>

      {/* Hero Section */}
      <div className="referral-hero">
        <div className="hero-content">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <span className="step-text">Share your unique code</span>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <span className="step-text">Friend signs up & books</span>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <span className="step-text">Both get rewards!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Referral Code */}
      <div className="referral-code-section">
        <div className="code-card">
          <h3>Your Referral Code</h3>
          {referralInfo?.referred_by?.referral_code ? (
            <div className="code-display">
              <span className="code">
                {referralInfo.referred_by.referral_code}
              </span>
              <button
                className="btn btn-copy"
                onClick={() =>
                  copyToClipboard(referralInfo.referred_by.referral_code)
                }
              >
                Copy
              </button>
            </div>
          ) : (
            <button className="btn btn-generate" onClick={generateCode}>
              Generate Your Code
            </button>
          )}
          <p className="code-note">
            Share this code with friends and earn rewards when they book their
            first service!
          </p>
        </div>
      </div>

      {/* Stats */}
      {referralInfo && (
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-number">
              {referralInfo.stats?.total_referrals || 0}
            </span>
            <span className="stat-label">Total Referrals</span>
          </div>
          <div className="stat-card success">
            <span className="stat-number">
              {referralInfo.stats?.successful_referrals || 0}
            </span>
            <span className="stat-label">Successful</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {referralInfo.rewards?.length || 0}
            </span>
            <span className="stat-label">Rewards Available</span>
          </div>
        </div>
      )}

      {/* Your Rewards */}
      {referralInfo?.rewards?.length > 0 && (
        <div className="rewards-section">
          <h2>Your Rewards</h2>
          <div className="rewards-list">
            {referralInfo.rewards.map((reward) => (
              <div key={reward.id} className="reward-card">
                <div className="reward-icon">🎁</div>
                <div className="reward-details">
                  <h4>{reward.description}</h4>
                  <p>
                    Value: {reward.reward_value}{" "}
                    {reward.reward_type === "points" ? "Points" : "$"}
                  </p>
                  {reward.expires_at && (
                    <p className="expires">
                      Expires:{" "}
                      {new Date(reward.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Use Referral Code */}
      <div className="use-code-section">
        <h2>Have a Referral Code?</h2>
        <p>Enter a friend's referral code to earn rewards</p>
        <div className="use-code-form">
          <input
            type="text"
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          />
          <input
            type="email"
            placeholder="Your email"
            value={useCodeEmail}
            onChange={(e) => setUseCodeEmail(e.target.value)}
          />
          <button className="btn btn-apply" onClick={useReferralCode}>
            Apply Code
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Use Code Modal */}
      {showCodeModal && (
        <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowCodeModal(false)}
            >
              ×
            </button>
            <h2>🎉 Your Referral Code</h2>
            <div className="generated-code">
              <span className="code">{referralCode}</span>
            </div>
            <p>Share this code with friends!</p>
            <button
              className="btn btn-copy-large"
              onClick={() => copyToClipboard(referralCode)}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        .referrals-page {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }
        
        .referral-hero {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          border-radius: 16px;
          padding: 3rem;
          margin-bottom: 2rem;
          color: white;
        }
        
        .hero-content h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }
        
        .steps {
          display: flex;
          justify-content: center;
          gap: 3rem;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .step-number {
          width: 50px;
          height: 50px;
          background: white;
          color: #4CAF50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .step-text {
          font-size: 1rem;
          text-align: center;
        }
        
        .referral-code-section {
          margin-bottom: 2rem;
        }
        
        .code-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .code-card h3 {
          color: #1a1a2e;
          margin-bottom: 1.5rem;
        }
        
        .code-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .code-display .code {
          font-size: 2.5rem;
          font-weight: 700;
          color: #4CAF50;
          letter-spacing: 4px;
        }
        
        .code-note {
          color: #666;
          font-size: 0.9rem;
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 1rem;
        }
        
        .btn-generate {
          background: #4CAF50;
          color: white;
        }
        
        .btn-copy {
          background: #e0e0e0;
          color: #333;
        }
        
        .btn-copy-large {
          background: #4CAF50;
          color: white;
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card.success {
          background: #4CAF50;
          color: white;
        }
        
        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #4CAF50;
        }
        
        .stat-card.success .stat-number {
          color: white;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
        
        .stat-card.success .stat-label {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .rewards-section {
          margin-bottom: 2rem;
        }
        
        .rewards-section h2 {
          color: #1a1a2e;
          margin-bottom: 1.5rem;
        }
        
        .rewards-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .reward-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .reward-icon {
          font-size: 2.5rem;
        }
        
        .reward-details h4 {
          margin: 0 0 0.25rem 0;
          color: #1a1a2e;
        }
        
        .reward-details p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .expires {
          color: #FFA500;
          font-size: 0.85rem;
        }
        
        .use-code-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .use-code-section h2 {
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }
        
        .use-code-section > p {
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .use-code-form {
          display: flex;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .use-code-form input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        
        .use-code-form input:focus {
          outline: none;
          border-color: #4CAF50;
        }
        
        .btn-apply {
          background: #4CAF50;
          color: white;
        }
        
        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }
        
        .alert-error {
          background: #ffebee;
          color: #c62828;
        }
        
        .alert-success {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
          width: 90%;
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
        }
        
        .modal-content h2 {
          margin-bottom: 1.5rem;
        }
        
        .generated-code {
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .generated-code .code {
          font-size: 2rem;
          font-weight: 700;
          color: #4CAF50;
          letter-spacing: 4px;
        }
      `}</style>
    </div>
  );
};

export default Referrals;
