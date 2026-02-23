import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  QrCodeIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import QRCode from "qrcode";

const QRCheckin = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
    vehicle: "2019 Honda Civic",
    licensePlate: "ABC-1234",
  });

  useEffect(() => {
    generateQRCode();
    fetchAppointmentData();
  }, []);

  const generateQRCode = async () => {
    try {
      const qrData = {
        userId: "user_12345",
        appointmentId: "APT-2025-1234",
        timestamp: new Date().toISOString(),
        location: "Abe Garage - Main Location",
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCode(qrCodeDataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const fetchAppointmentData = async () => {
    // Mock appointment data
    const mockAppointment = {
      id: "APT-2025-1234",
      date: "2025-12-12",
      time: "10:00 AM",
      serviceType: "Oil Change & Filter Replacement",
      duration: "45 minutes",
      technician: "John Smith",
      location: "Abe Garage - Main Location",
      address: "123 Auto Service Boulevard, New York, NY 10001",
      estimatedCost: "$65.99",
      status: "confirmed",
      checkInTime: null,
      bayNumber: null,
      notes: "Customer requested premium oil change",
    };

    setTimeout(() => {
      setAppointmentData(mockAppointment);
      setLoading(false);
    }, 1000);
  };

  const handleQRCodeGenerated = () => {
    setCurrentStep(2);
  };

  const handleCheckIn = () => {
    // Simulate check-in process
    setCheckInStatus("processing");

    setTimeout(() => {
      setCheckInStatus("completed");
      setCurrentStep(3);
      // Update appointment data with check-in info
      setAppointmentData((prev) => ({
        ...prev,
        checkInTime: new Date().toLocaleTimeString(),
        bayNumber: "Bay 2",
        status: "checked_in",
      }));
    }, 2000);
  };

  const handleStartService = () => {
    // Navigate to service tracking
    window.location.href = "/track-my-car";
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <QrCodeIcon className="me-2 text-primary" />
            QR Check-in
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Preparing your check-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-checkin-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <motion.div
              className="checkin-header text-center mb-5"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-3">
                <QrCodeIcon className="me-3 text-primary" />
                Service Check-in
              </h1>
              <p className="text-muted">
                Check in for your appointment quickly and easily using QR code
                technology.
              </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              className="progress-steps mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="d-flex justify-content-center align-items-center">
                <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Generate QR</div>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Check In</div>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Get Service</div>
                </div>
              </div>
            </motion.div>

            {/* Step Content */}
            <motion.div
              className="step-content"
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Generate QR Code */}
              {currentStep === 1 && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <SparklesIcon className="me-2" />
                      Your Check-in QR Code
                    </h6>
                  </div>
                  <div className="card-body text-center">
                    <div className="qr-code-container mb-4">
                      {qrCode ? (
                        <motion.img
                          src={qrCode}
                          alt="Check-in QR Code"
                          className="qr-code"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        />
                      ) : (
                        <div className="qr-placeholder">
                          <QrCodeIcon className="w-24 h-24 text-muted" />
                        </div>
                      )}
                    </div>

                    <h5 className="mb-3">
                      Show this QR code at the service desk
                    </h5>
                    <p className="text-muted mb-4">
                      Our staff will scan this code to quickly check you in and
                      start your service.
                    </p>

                    <div className="appointment-summary mb-4">
                      {appointmentData && (
                        <div className="bg-light rounded p-3">
                          <h6 className="mb-2">Appointment Details</h6>
                          <div className="row g-2 text-start">
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Service
                              </small>
                              <span className="fw-medium">
                                {appointmentData.serviceType}
                              </span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">Time</small>
                              <span className="fw-medium">
                                {appointmentData.date} at {appointmentData.time}
                              </span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Technician
                              </small>
                              <span className="fw-medium">
                                {appointmentData.technician}
                              </span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Duration
                              </small>
                              <span className="fw-medium">
                                {appointmentData.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={handleQRCodeGenerated}
                      >
                        <QrCodeIcon className="w-5 h-5 me-2" />
                        QR Code Ready - Proceed to Check-in
                      </button>
                      <small className="text-muted">
                        Keep this page open or take a screenshot for quick
                        access
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Check In */}
              {currentStep === 2 && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <CheckCircleIcon className="me-2" />
                      Check In Now
                    </h6>
                  </div>
                  <div className="card-body text-center">
                    {checkInStatus === "pending" && (
                      <>
                        <div className="check-in-instructions mb-4">
                          <CameraIcon className="w-16 h-16 text-primary mb-3" />
                          <h5 className="mb-3">Ready to Check In</h5>
                          <p className="text-muted mb-4">
                            Please present your QR code to our service desk
                            staff for scanning, or use the camera below if
                            available.
                          </p>
                        </div>

                        <div className="customer-info mb-4">
                          <div className="bg-light rounded p-3">
                            <h6 className="mb-2">Customer Information</h6>
                            <div className="row g-2 text-start">
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Name
                                </small>
                                <span className="fw-medium">
                                  {userInfo.name}
                                </span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Phone
                                </small>
                                <span className="fw-medium">
                                  {userInfo.phone}
                                </span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Vehicle
                                </small>
                                <span className="fw-medium">
                                  {userInfo.vehicle}
                                </span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  License Plate
                                </small>
                                <span className="fw-medium">
                                  {userInfo.licensePlate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-lg"
                            onClick={handleCheckIn}
                          >
                            <CheckCircleIcon className="w-5 h-5 me-2" />
                            I've Checked In
                          </button>
                          <button className="btn btn-outline-primary">
                            <CameraIcon className="w-4 h-4 me-2" />
                            Scan QR with Camera
                          </button>
                        </div>
                      </>
                    )}

                    {checkInStatus === "processing" && (
                      <div className="check-in-processing">
                        <div
                          className="spinner-border text-primary mb-3"
                          role="status"
                        >
                          <span className="visually-hidden">Processing...</span>
                        </div>
                        <h5 className="mb-3">Processing Check-in...</h5>
                        <p className="text-muted">
                          Please wait while we verify your appointment and
                          assign a service bay.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Service Started */}
              {currentStep === 3 && (
                <div className="card">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">
                      <CheckCircleIcon className="me-2" />
                      Check-in Successful!
                    </h6>
                  </div>
                  <div className="card-body text-center">
                    <div className="success-animation mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        <CheckCircleIcon className="w-24 h-24 text-success mb-3" />
                      </motion.div>
                      <h4 className="text-success mb-3">
                        Welcome to Abe Garage!
                      </h4>
                      <p className="text-muted">
                        You have been successfully checked in. Your vehicle is
                        now in our system.
                      </p>
                    </div>

                    <div className="service-details mb-4">
                      {appointmentData && (
                        <div className="bg-light rounded p-3">
                          <h6 className="mb-3">Service Assignment</h6>
                          <div className="row g-2 text-start">
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Service Bay
                              </small>
                              <span className="fw-bold text-primary fs-5">
                                {appointmentData.bayNumber}
                              </span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Check-in Time
                              </small>
                              <span className="fw-medium">
                                {appointmentData.checkInTime}
                              </span>
                            </div>
                            <div className="col-12">
                              <small className="text-muted d-block">
                                Service
                              </small>
                              <span className="fw-medium">
                                {appointmentData.serviceType}
                              </span>
                            </div>
                            <div className="col-12">
                              <small className="text-muted d-block">
                                Estimated Completion
                              </small>
                              <span className="fw-medium">
                                {appointmentData.time} -{" "}
                                {appointmentData.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={handleStartService}
                      >
                        <WrenchScrewdriverIcon className="w-5 h-5 me-2" />
                        Track My Service
                      </button>
                      <button className="btn btn-outline-secondary">
                        <InformationCircleIcon className="w-4 h-4 me-2" />
                        Service Information
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Help Section */}
            <motion.div
              className="help-section mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="card">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-warning me-3" />
                        <div>
                          <h6 className="mb-1">Need Help?</h6>
                          <small className="text-muted">
                            If you're having trouble with QR check-in, our staff
                            can assist you manually.
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <ClockIcon className="w-5 h-5 text-info me-3" />
                        <div>
                          <h6 className="mb-1">Arriving Early?</h6>
                          <small className="text-muted">
                            You can check in up to 15 minutes before your
                            appointment time.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .progress-steps {
          padding: 2rem 0;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: #3b82f6;
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
        }

        .step.active .step-label {
          color: #3b82f6;
          font-weight: 600;
        }

        .step-connector {
          width: 60px;
          height: 2px;
          background: #e5e7eb;
          margin: 0 1rem;
          margin-bottom: 2rem;
        }

        .qr-code-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 250px;
        }

        .qr-code {
          border: 8px solid white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .qr-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 250px;
          background: #f3f4f6;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .step-connector {
            width: 40px;
            margin: 0 0.5rem;
          }

          .step-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCheckin;
