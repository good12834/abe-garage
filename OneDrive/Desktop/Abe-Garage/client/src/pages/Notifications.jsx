import React from "react";
import "../styles/professional-styles.css";
import NotificationCenter from "../components/widgets/NotificationCenter";

const Notifications = () => {
  return (
    <div className="notifications-page">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-2">
                  <i className="bi bi-bell text-primary me-3"></i>
                  Notifications Center
                </h1>
                <p className="text-muted mb-0">
                  Stay updated with all your service notifications and alerts
                </p>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Real-time Updates</small>
                <small className="fw-medium text-primary">Instant Alerts</small>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Center Component */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-0">
                <NotificationCenter />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-gear me-2"></i>
                  Notification Preferences
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="email-notifications"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="email-notifications"
                      >
                        <strong>Email Notifications</strong>
                        <br />
                        <small className="text-muted">
                          Receive notifications via email
                        </small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="sms-notifications"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="sms-notifications"
                      >
                        <strong>SMS Notifications</strong>
                        <br />
                        <small className="text-muted">
                          Receive urgent alerts via SMS
                        </small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="appointment-reminders"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="appointment-reminders"
                      >
                        <strong>Appointment Reminders</strong>
                        <br />
                        <small className="text-muted">
                          Get reminded about upcoming appointments
                        </small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="maintenance-alerts"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="maintenance-alerts"
                      >
                        <strong>Maintenance Alerts</strong>
                        <br />
                        <small className="text-muted">
                          Receive maintenance and service reminders
                        </small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="promotional-offers"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="promotional-offers"
                      >
                        <strong>Promotional Offers</strong>
                        <br />
                        <small className="text-muted">
                          Receive special offers and promotions
                        </small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="system-updates"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="system-updates"
                      >
                        <strong>System Updates</strong>
                        <br />
                        <small className="text-muted">
                          Get notified about new features and updates
                        </small>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
