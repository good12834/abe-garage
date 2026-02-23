import React, { useState, useEffect } from "react";
import {
  FaQrcode,
  FaCamera,
  FaCheckCircle,
  FaTimes,
  FaMobile,
  FaDownload,
  FaPrint,
  FaShare,
  FaMapMarkerAlt,
} from "react-icons/fa";
import QRCode from "qrcode";

const QRCodeSystem = ({
  customerInfo,
  appointmentInfo,
  onCheckIn,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerResult, setScannerResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (customerInfo && appointmentInfo) {
      generateQRCode();
    }
  }, [customerInfo, appointmentInfo]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Create QR code data
      const qrData = {
        type: "service_checkin",
        customerId: customerInfo.id,
        customerName: customerInfo.name,
        appointmentId: appointmentInfo.id,
        appointmentTime: appointmentInfo.time,
        serviceType: appointmentInfo.serviceType,
        vehicleInfo: appointmentInfo.vehicleInfo,
        timestamp: new Date().toISOString(),
        location: "Abe Garage Service Center",
      };

      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#333333",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `service-qr-${appointmentInfo.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Service Check-in QR Code</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 40px;
            }
            .qr-container { 
              margin: 20px auto; 
              max-width: 400px;
            }
            .info { 
              margin: 20px 0; 
              color: #666;
            }
            .customer-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #333;
              margin-bottom: 10px;
            }
            .appointment-info { 
              font-size: 16px; 
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Service Check-in QR Code</h1>
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="QR Code" />
          </div>
          <div class="info">
            <div class="customer-name">${customerInfo.name}</div>
            <div class="appointment-info">
              Appointment: ${appointmentInfo.time}<br>
              Service: ${appointmentInfo.serviceType}<br>
              Vehicle: ${appointmentInfo.vehicleInfo}
            </div>
          </div>
          <p>Present this QR code at the service center for quick check-in</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Service Check-in QR Code",
          text: `Service appointment for ${customerInfo.name} - ${appointmentInfo.serviceType}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText =
        `Service Check-in QR Code for ${customerInfo.name}\n` +
        `Appointment: ${appointmentInfo.time}\n` +
        `Service: ${appointmentInfo.serviceType}\n` +
        `Vehicle: ${appointmentInfo.vehicleInfo}\n\n` +
        `Please present this at Abe Garage Service Center.`;

      navigator.clipboard.writeText(shareText).then(() => {
        alert("QR code information copied to clipboard!");
      });
    }
  };

  const startQRScanner = () => {
    setShowScanner(true);
    // In a real implementation, you would use a QR scanner library like html5-qrcode
    // For now, we'll simulate the scanner functionality
    setTimeout(() => {
      setScannerResult({
        type: "service_checkin",
        customerId: "123",
        customerName: "John Doe",
        appointmentId: "456",
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleScannerResult = (result) => {
    setIsLoading(true);
    try {
      const checkInData = JSON.parse(result);
      if (checkInData.type === "service_checkin") {
        onCheckIn(checkInData);
      }
    } catch (error) {
      console.error("Invalid QR code data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showScanner) {
    return (
      <div className="qr-scanner-modal">
        <div className="scanner-header">
          <h3>Scan Service QR Code</h3>
          <button
            className="close-scanner"
            onClick={() => setShowScanner(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="scanner-content">
          {!scannerResult ? (
            <div className="scanner-view">
              <div className="scanner-frame">
                <FaCamera className="scanner-icon" />
                <p>Position QR code within the frame</p>
                <div className="scanner-line"></div>
              </div>

              <div className="scanner-actions">
                <button className="scan-btn" onClick={startQRScanner}>
                  <FaQrcode />
                  Start Scanning
                </button>
                <button
                  className="manual-input-btn"
                  onClick={() => setShowScanner(false)}
                >
                  Manual Input
                </button>
              </div>
            </div>
          ) : (
            <div className="scanner-result">
              <div className="result-success">
                <FaCheckCircle className="success-icon" />
                <h4>QR Code Scanned Successfully!</h4>
                <div className="result-details">
                  <p>
                    <strong>Customer:</strong> {scannerResult.customerName}
                  </p>
                  <p>
                    <strong>Appointment ID:</strong>{" "}
                    {scannerResult.appointmentId}
                  </p>
                  <p>
                    <strong>Scan Time:</strong>{" "}
                    {new Date(scannerResult.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  className="check-in-btn"
                  onClick={() =>
                    handleScannerResult(JSON.stringify(scannerResult))
                  }
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Check In Customer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="qr-code-system">
      <div className="qr-header">
        <div className="qr-title">
          <FaQrcode className="qr-icon" />
          <h3>Service Check-in QR Code</h3>
        </div>
        <button className="qr-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="qr-content">
        {isGenerating ? (
          <div className="qr-generating">
            <div className="loading-spinner"></div>
            <p>Generating QR Code...</p>
          </div>
        ) : (
          <div className="qr-display">
            {qrCodeUrl && (
              <div className="qr-code-container">
                <img
                  src={qrCodeUrl}
                  alt="Service QR Code"
                  className="qr-code"
                />
                <div className="qr-overlay">
                  <div className="qr-info">
                    <div className="customer-name">{customerInfo.name}</div>
                    <div className="appointment-details">
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{appointmentInfo.time}</span>
                      </div>
                      <div className="detail-item">
                        <FaMobile />
                        <span>{appointmentInfo.serviceType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="qr-actions">
              <button
                className="qr-action-btn primary"
                onClick={handleDownloadQR}
              >
                <FaDownload />
                Download QR
              </button>
              <button
                className="qr-action-btn secondary"
                onClick={handlePrintQR}
              >
                <FaPrint />
                Print QR
              </button>
              <button
                className="qr-action-btn secondary"
                onClick={handleShareQR}
              >
                <FaShare />
                Share QR
              </button>
            </div>
          </div>
        )}

        <div className="qr-instructions">
          <h4>How to Use Your QR Code</h4>
          <div className="instruction-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h5>Save or Print</h5>
                <p>Download or print this QR code for easy access</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h5>Arrive at Service Center</h5>
                <p>Present the QR code when you arrive for your appointment</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h5>Quick Check-in</h5>
                <p>Our staff will scan your code for instant check-in</p>
              </div>
            </div>
          </div>
        </div>

        <div className="qr-benefits">
          <h4>QR Code Benefits</h4>
          <div className="benefits-grid">
            <div className="benefit-item">
              <FaCheckCircle className="benefit-icon" />
              <span>Instant Check-in</span>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="benefit-icon" />
              <span>No Paperwork</span>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="benefit-icon" />
              <span>Faster Service</span>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="benefit-icon" />
              <span>Real-time Tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="qr-footer">
        <button
          className="staff-scanner-btn"
          onClick={() => setShowScanner(true)}
        >
          <FaCamera />
          Staff: Open QR Scanner
        </button>
      </div>
    </div>
  );
};

export default QRCodeSystem;
