import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import './ChangePassword.css';

// Icon component for consistent Material Icons usage
function MaterialIcon({ name, size = 24, className = "", style = {} }) {
  return (
    <span className={`material-icons md-${size} ${className}`} style={{ fontSize: `${size}px`, ...style }}>
      {name}
    </span>
  );
}

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const togglePass = (field) => {
    setShowPass(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      newErrors.new_password = "Add uppercase, lowercase, and numbers";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (formData.current_password && formData.current_password === formData.new_password) {
      newErrors.new_password = "New password must be different";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      toast.success("Password changed successfully!");
      navigate("/customer/settings");
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || "Failed to change password";
      toast.error(errorMessage);

      if (error.response?.status === 400) {
        setErrors({ current_password: "Current password is incorrect" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/customer/settings");
  };

  const S = `
    /* Material Icons font import */
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    
    .material-icons {
      font-size: 24px;
      vertical-align: middle;
    }
  `;

  return (
    <div className="cp">
      <style>{S}</style>

      {/* ── LEFT PANEL ── */}
      <div className="cp-left">
        <div className="cp-left-top">
          <Link to="/" className="cp-brand">
            <div className="cp-brand-icon">
              <MaterialIcon name="build" size={32} />
            </div>
            <div>
              <span className="cp-brand-name">ABE<span>GARAGE</span></span>
              <span className="cp-brand-tag">Certified Excellence</span>
            </div>
          </Link>

          <div className="cp-headline">
            <div className="cp-eyebrow">
              <MaterialIcon name="security" size={14} /> Security Center
            </div>
            <h1 className="cp-big-title">
              Secure Your<br /><em>Account</em><br />Access
            </h1>
            <p className="cp-desc">
              Change your password regularly to keep your account and vehicle information safe. We recommend using a unique and strong password.
            </p>
          </div>

          <div className="cp-features">
            {[
              { icon: 'info', title: 'Strong Password', desc: 'Min 8 chars, mixed case & numbers' },
              { icon: 'devices', title: 'Global Logout', desc: 'Securely logs out from other devices' },
              { icon: 'verified_user', title: 'Protected Data', desc: 'Your history is encrypted and private' },
            ].map(f => (
              <div key={f.title} className="cp-feature">
                <div className="cp-feature-icon">
                  <MaterialIcon name={f.icon} size={28} />
                </div>
                <div className="cp-feature-text">
                  <strong>{f.title}</strong> {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="cp-right">
        <div className="cp-form-wrap">

          <div className="cp-form-header">
            <div className="cp-form-header-icon">
              <MaterialIcon name="lock_reset" size={32} />
            </div>
            <div className="cp-form-title">Update Password</div>
            <div className="cp-form-subtitle">Choose a new password for your account</div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Current Password */}
            <div className="cp-field">
              <label className="cp-label">
                Current Password
              </label>
              <div className="cp-input-group">
                <div className="cp-input-prefix">
                  <MaterialIcon name="lock" size={18} />
                </div>
                <input
                  className={`cp-input ${errors.current_password ? 'is-invalid' : ''}`}
                  type={showPass.current ? 'text' : 'password'}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <button
                type="button"
                className="cp-input-toggle"
                onClick={() => togglePass('current')}
                tabIndex={-1}
              >
                <MaterialIcon name={showPass.current ? "visibility_off" : "visibility"} size={20} />
              </button>
              {errors.current_password && (
                <div className="cp-invalid-feedback">{errors.current_password}</div>
              )}
            </div>

            {/* New Password */}
            <div className="cp-field">
              <label className="cp-label">
                New Password
              </label>
              <div className="cp-input-group">
                <div className="cp-input-prefix">
                  <MaterialIcon name="vpn_key" size={18} />
                </div>
                <input
                  className={`cp-input ${errors.new_password ? 'is-invalid' : ''}`}
                  type={showPass.new ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <button
                type="button"
                className="cp-input-toggle"
                onClick={() => togglePass('new')}
                tabIndex={-1}
              >
                <MaterialIcon name={showPass.new ? "visibility_off" : "visibility"} size={20} />
              </button>
              {errors.new_password && (
                <div className="cp-invalid-feedback">{errors.new_password}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="cp-field">
              <label className="cp-label">
                Confirm New Password
              </label>
              <div className="cp-input-group">
                <div className="cp-input-prefix">
                  <MaterialIcon name="verified" size={18} />
                </div>
                <input
                  className={`cp-input ${errors.confirm_password ? 'is-invalid' : ''}`}
                  type={showPass.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Repeat new password"
                  required
                />
              </div>
              <button
                type="button"
                className="cp-input-toggle"
                onClick={() => togglePass('confirm')}
                tabIndex={-1}
              >
                <MaterialIcon name={showPass.confirm ? "visibility_off" : "visibility"} size={20} />
              </button>
              {errors.confirm_password && (
                <div className="cp-invalid-feedback">{errors.confirm_password}</div>
              )}
            </div>

            <div className="cp-alert-info">
              <i className="material-icons">info</i>
              <div>
                <strong>Security:</strong> You will be logged out of other sessions after this change.
              </div>
            </div>

            <button type="submit" className="cp-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="cp-spinner"></div> Updating...
                </>
              ) : (
                <>
                  <MaterialIcon name="save" size={18} /> Update Password
                </>
              )}
            </button>

            <button
              type="button"
              className="cp-btn-cancel"
              onClick={handleCancel}
            >
              <MaterialIcon name="close" size={18} /> Cancel
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ChangePassword;