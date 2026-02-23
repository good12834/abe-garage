import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import './Profile.css';

// Icon component for consistent Material Icons usage
function MaterialIcon({ name, size = 24, className = "", style = {} }) {
  return (
    <span className={`material-icons md-${size} ${className}`} style={{ fontSize: `${size}px`, ...style }}>
      {name}
    </span>
  );
}

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    date_of_birth: "",
  });

  useEffect(() => {
    // Load current user data
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zip_code: user.zip_code || "",
        date_of_birth: user.date_of_birth
          ? user.date_of_birth.split("T")[0]
          : "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      // Update local user data
      login(response.data.user);
      toast.success("Profile updated successfully!");
      navigate("/customer/settings");
    } catch (error) {
      toast.error("Failed to update profile");
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
    <div className="pp">
      <style>{S}</style>

      {/* ── LEFT PANEL ── */}
      <div className="pp-left">
        <div className="pp-left-top">
          <Link to="/" className="pp-brand">
            <div className="pp-brand-icon">
              <MaterialIcon name="build" size={32} />
            </div>
            <div>
              <span className="pp-brand-name">ABE<span>GARAGE</span></span>
              <span className="pp-brand-tag">Certified Excellence</span>
            </div>
          </Link>

          <div className="pp-headline">
            <div className="pp-eyebrow">
              <MaterialIcon name="manage_accounts" size={14} /> Account Settings
            </div>
            <h1 className="pp-big-title">
              Manage Your<br /><em>Profile</em><br />Details
            </h1>
          </div>

          <div className="pp-profile-preview">
            <div className="pp-avatar-circle">
              <MaterialIcon name="person" size={56} />
            </div>
            <div className="pp-preview-name">
              {formData.first_name} {formData.last_name}
            </div>
            <div className="pp-preview-email">{formData.email}</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="pp-right">
        <div className="pp-form-wrap">

          <div className="pp-form-header">
            <div className="pp-form-header-icon">
              <MaterialIcon name="edit" size={32} />
            </div>
            <div className="pp-form-title">Edit Profile</div>
            <div className="pp-form-subtitle">Update your personal and contact information</div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Personal Information */}
            <div className="pp-section-title">
              <MaterialIcon name="badge" size={16} /> Personal Info
            </div>
            <div className="pp-grid">
              <div className="pp-field">
                <label className="pp-label">First Name</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="person" size={18} /></div>
                  <input name="first_name" className="pp-input" value={formData.first_name} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">Last Name</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="person" size={18} /></div>
                  <input name="last_name" className="pp-input" value={formData.last_name} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">Email Address</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="email" size={18} /></div>
                  <input name="email" type="email" className="pp-input" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">Phone Number</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="phone" size={18} /></div>
                  <input name="phone" type="tel" className="pp-input" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>
              <div className="pp-field full-width">
                <label className="pp-label">Date of Birth</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="cake" size={18} /></div>
                  <input name="date_of_birth" type="date" className="pp-input" value={formData.date_of_birth} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="pp-section-title">
              <MaterialIcon name="home" size={16} /> Address Info
            </div>
            <div className="pp-grid">
              <div className="pp-field full-width">
                <label className="pp-label">Street Address</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="place" size={18} /></div>
                  <input name="address" className="pp-input" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">City</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="location_city" size={18} /></div>
                  <input name="city" className="pp-input" value={formData.city} onChange={handleInputChange} />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">State</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="map" size={18} /></div>
                  <input name="state" className="pp-input" value={formData.state} onChange={handleInputChange} />
                </div>
              </div>
              <div className="pp-field full-width">
                <label className="pp-label">Zip Code</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="pin_drop" size={18} /></div>
                  <input name="zip_code" className="pp-input" value={formData.zip_code} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="pp-section-title">
              <MaterialIcon name="info" size={16} /> Account Summary
            </div>
            <div className="pp-grid">
              <div className="pp-field">
                <label className="pp-label">Account Type</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="admin_panel_settings" size={18} /></div>
                  <input className="pp-input" value={user?.role === "customer" ? "Customer" : user?.role || "N/A"} readOnly />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">Member Since</label>
                <div className="pp-input-group">
                  <div className="pp-input-prefix"><MaterialIcon name="calendar_today" size={18} /></div>
                  <input className="pp-input" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"} readOnly />
                </div>
              </div>
            </div>

            <button type="submit" className="pp-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="pp-spinner"></div> Updating...
                </>
              ) : (
                <>
                  <MaterialIcon name="check_circle" size={18} /> Update Profile
                </>
              )}
            </button>

            <button type="button" className="pp-btn-cancel" onClick={handleCancel}>
              <MaterialIcon name="close" size={18} /> Cancel
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;

