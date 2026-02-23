import React from "react";
import "../styles/professional-styles.css";
import ServiceHistoryTimeline from "../components/timeline/ServiceHistoryTimeline";

const VehicleHistory = () => {
  return (
    <div className="vehicle-history-page">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-2">
                  <i className="bi bi-clock-history text-primary me-3"></i>
                  Vehicle Service History
                </h1>
                <p className="text-muted mb-0">
                  Complete timeline of your vehicle's maintenance and service
                  records
                </p>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Service Timeline</small>
                <small className="fw-medium text-primary">
                  Historical Records
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Service History Timeline Component */}
        <div className="row">
          <div className="col-12">
            <ServiceHistoryTimeline />
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-tools me-2"></i>
                  History Management Features
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="feature-item text-center">
                      <i className="bi bi-filter text-primary fs-2 mb-2"></i>
                      <h6>Advanced Filtering</h6>
                      <p className="text-muted small">
                        Filter service history by type, date, or technician
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="feature-item text-center">
                      <i className="bi bi-images text-success fs-2 mb-2"></i>
                      <h6>Photo Documentation</h6>
                      <p className="text-muted small">
                        Before and after photos of all service work
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="feature-item text-center">
                      <i className="bi bi-file-earmark-pdf text-warning fs-2 mb-2"></i>
                      <h6>Export Reports</h6>
                      <p className="text-muted small">
                        Download detailed service reports and summaries
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

export default VehicleHistory;
