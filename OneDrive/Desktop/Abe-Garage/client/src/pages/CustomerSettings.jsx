import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

const CustomerSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    appointmentReminders: true,
    maintenanceAlerts: true,
  });

  useEffect(() => {
    // Load user settings (placeholder - would come from API)
    // For now, use default settings
  }, []);

  const handleSettingChange = (settingName, value) => {
    setSettings((prev) => ({
      ...prev,
      [settingName]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings to API (placeholder)
      // await settingsAPI.updateUserSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        // Delete account API call (placeholder)
        // await authAPI.deleteAccount();
        logout();
        navigate("/");
        toast.success("Account deleted successfully");
      } catch (error) {
        toast.error("Failed to delete account");
      }
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);

      // Collect user data for export
      const exportData = {
        userProfile: {
          id: user?.id,
          first_name: user?.first_name,
          last_name: user?.last_name,
          email: user?.email,
          phone: user?.phone,
          role: user?.role,
          created_at: user?.created_at,
          updated_at: user?.updated_at,
        },
        accountSettings: settings,
        exportDate: new Date().toISOString(),
        exportInfo: {
          exportedBy: `${user?.first_name} ${user?.last_name}`,
          exportedFrom: "Abe Garage Customer Portal",
          dataRetention:
            "This export contains your personal data as stored in our system",
        },
        // In a real application, you would fetch additional data like:
        // appointments: await appointmentsAPI.getUserAppointments(),
        // invoices: await invoicesAPI.getUserInvoices(),
        // serviceHistory: await servicesAPI.getUserServiceHistory(),
      };

      // Convert to JSON string
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `abe-garage-data-export-${user?.id || "user"}-${
        new Date().toISOString().split("T")[0]
      }.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      toast.success("Data export completed successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-settings">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Account Settings</h2>
              <button
                className="btn btn-outline-danger"
                onClick={handleDeleteAccount}
              >
                <i className="bi bi-trash me-2"></i>
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  Profile Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.first_name || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.last_name || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={user?.phone || ""}
                      readOnly
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => navigate("/profile")}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Profile
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/change-password")}
                  >
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-shield-check me-2"></i>
                  Account Status
                </h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  <span className="badge bg-success fs-6 px-3 py-2">
                    <i className="bi bi-check-circle me-2"></i>
                    Active Account
                  </span>
                </div>
                <p className="text-muted mb-0">
                  Member since:{" "}
                  {new Date(
                    user?.created_at || Date.now()
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-bell me-2"></i>
                  Notification Preferences
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="emailNotifications"
                      >
                        <strong>Email Notifications</strong>
                        <br />
                        <small className="text-muted">
                          Receive appointment updates via email
                        </small>
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smsNotifications"
                        checked={settings.smsNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "smsNotifications",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="smsNotifications"
                      >
                        <strong>SMS Notifications</strong>
                        <br />
                        <small className="text-muted">
                          Receive text messages for urgent updates
                        </small>
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="appointmentReminders"
                        checked={settings.appointmentReminders}
                        onChange={(e) =>
                          handleSettingChange(
                            "appointmentReminders",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="appointmentReminders"
                      >
                        <strong>Appointment Reminders</strong>
                        <br />
                        <small className="text-muted">
                          Get reminded about upcoming appointments
                        </small>
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="maintenanceAlerts"
                        checked={settings.maintenanceAlerts}
                        onChange={(e) =>
                          handleSettingChange(
                            "maintenanceAlerts",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="maintenanceAlerts"
                      >
                        <strong>Maintenance Alerts</strong>
                        <br />
                        <small className="text-muted">
                          Receive maintenance recommendations
                        </small>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveSettings}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-lock me-2"></i>
                  Privacy & Security
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="marketingEmails"
                        checked={settings.marketingEmails}
                        onChange={(e) =>
                          handleSettingChange(
                            "marketingEmails",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="marketingEmails"
                      >
                        <strong>Marketing Emails</strong>
                        <br />
                        <small className="text-muted">
                          Receive promotional emails and offers
                        </small>
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Data Export</strong>
                      </label>
                      <br />
                      <small className="text-muted d-block mb-2">
                        Download a copy of your data
                      </small>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleExportData}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-download me-2"></i>
                            Export Data
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;
