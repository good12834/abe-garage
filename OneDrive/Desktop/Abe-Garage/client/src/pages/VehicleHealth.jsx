import React from "react";
import "../styles/professional-styles.css";
import VehicleHealthDashboard from "../components/health/VehicleHealthDashboard";

const VehicleHealth = () => {
  return (
    <div className="vehicle-health-page">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-2">
                  <i className="bi bi-shield-check text-primary me-3"></i>
                  Vehicle Health Monitor
                </h1>
                <p className="text-muted mb-0">
                  Comprehensive vehicle diagnostics and health monitoring system
                </p>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">
                  Real-time Monitoring
                </small>
                <small className="fw-medium text-primary">
                  AI-Powered Analysis
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Health Dashboard Component */}
        <div className="row">
          <div className="col-12">
            <VehicleHealthDashboard />
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-tools me-2"></i>
                  Health Monitoring Features
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="feature-item text-center">
                      <i className="bi bi-graph-up text-primary fs-2 mb-2"></i>
                      <h6>Real-time Analytics</h6>
                      <p className="text-muted small">
                        Continuous monitoring of vehicle systems and performance
                        metrics
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="feature-item text-center">
                      <i className="bi bi-bell text-warning fs-2 mb-2"></i>
                      <h6>Proactive Alerts</h6>
                      <p className="text-muted small">
                        Get notified before issues become major problems
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="feature-item text-center">
                      <i className="bi bi-clipboard-check text-success fs-2 mb-2"></i>
                      <h6>Detailed Reports</h6>
                      <p className="text-muted small">
                        Comprehensive assessment reports with actionable
                        recommendations
                      </p>
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

export default VehicleHealth;
