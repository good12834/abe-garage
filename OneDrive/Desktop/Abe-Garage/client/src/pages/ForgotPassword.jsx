import React, { useState } from "react";
import "../styles/professional-styles.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-fluid">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-9">
            <div className="professional-card shadow-lg border-0">
              <div className="professional-card-content p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i
                      className="bi bi-envelope-check text-success"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h2 className="fw-bold professional-section-title">
                    Check Your Email
                  </h2>
                  <p className="text-muted">
                    We've sent password reset instructions to {email}
                  </p>
                </div>

                {/* Success Message */}
                <div className="alert alert-success border-0 rounded">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <strong>Password reset email sent!</strong> Please check your
                  inbox and follow the instructions to reset your password.
                </div>

                {/* Back to Login */}
                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="btn btn-primary btn-lg professional-btn"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
                  </Link>
                </div>

                {/* Didn't receive email */}
                <div className="text-center mt-3">
                  <p className="text-muted mb-2">Didn't receive the email?</p>
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => setSubmitted(false)}
                  >
                    Try again with a different email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100 align-items-center justify-content-center">
        <div className="col-lg-5 col-md-7 col-sm-9">
          <div className="professional-card shadow-lg border-0">
            <div className="professional-card-content p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i
                    className="bi bi-key text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
                <h2 className="fw-bold professional-section-title">
                  Forgot Password
                </h2>
                <p className="text-muted">
                  Enter your email address and we'll send you a link to reset
                  your password
                </p>
              </div>

              {/* Forgot Password Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                  />
                  <div className="form-text">
                    We'll send a password reset link to this email address.
                  </div>
                </div>

                <div className="d-grid mb-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    icon={<i className="bi bi-send"></i>}
                    className="professional-btn"
                  >
                    Send Reset Link
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Login
                  </Link>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-4 p-3 professional-card rounded">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-info-circle me-2"></i>
                  Need Help?
                </h6>
                <p className="text-muted small mb-0">
                  If you're having trouble accessing your account, please
                  contact our support team at support@abegarage.com or call
                  (555) 123-4567.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
