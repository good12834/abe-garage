import React, { useState, useRef, useEffect } from "react";
import {
  FaPen,
  FaEraser,
  FaUndo,
  FaRedo,
  FaSave,
  FaDownload,
  FaTrash,
  FaExpand,
  FaCompress,
  FaSignature,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const DigitalSignature = ({
  documentInfo,
  customerInfo,
  onSignatureComplete,
  onClose,
  isOpen,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [documentExpanded, setDocumentExpanded] = useState(false);
  const [customerName, setCustomerName] = useState(customerInfo?.name || "");
  const [signatureType, setSignatureType] = useState("approval");

  const documentTypes = {
    approval: {
      title: "Service Approval",
      description:
        "I authorize the performed services and agree to the charges.",
      fields: ["Service Description", "Total Amount", "Warranty Terms"],
    },
    estimate: {
      title: "Service Estimate Agreement",
      description: "I approve this estimate for the proposed services.",
      fields: ["Estimated Cost", "Service Timeline", "Parts Required"],
    },
    warranty: {
      title: "Warranty Agreement",
      description:
        "I acknowledge and accept the warranty terms for completed services.",
      fields: ["Warranty Period", "Coverage Details", "Terms & Conditions"],
    },
    disclaimer: {
      title: "Service Disclaimer",
      description:
        "I understand and accept the limitations and terms of service.",
      fields: [
        "Liability Terms",
        "Service Limitations",
        "Customer Responsibilities",
      ],
    },
  };

  const currentDocument = documentTypes[signatureType];

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      initializeCanvas();
    }
  }, [isOpen]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 600;
    canvas.height = 200;

    // Set initial drawing style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    saveState();
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const pos = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.closePath();
    saveState();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    setUndoStack((prev) => [...prev, imageData]);
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  const undo = () => {
    if (undoStack.length > 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Move current state to redo stack
      const currentState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, currentState]);

      // Restore previous state
      const previousState = undoStack[undoStack.length - 2];
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = previousState;

      setUndoStack((prev) => prev.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Move redo state to undo stack
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, nextState]);

      // Restore redo state
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = nextState;

      setRedoStack((prev) => prev.slice(0, -1));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL("image/png");
    setSignatureData(signatureData);
    setIsCompleted(true);

    if (onSignatureComplete) {
      onSignatureComplete({
        signature: signatureData,
        customerName: customerName,
        documentType: signatureType,
        timestamp: new Date(),
        documentInfo: documentInfo,
      });
    }
  };

  const downloadSignature = () => {
    if (signatureData) {
      const link = document.createElement("a");
      link.download = `signature-${customerName.replace(
        /\s+/g,
        "-"
      )}-${Date.now()}.png`;
      link.href = signatureData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printDocument = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${currentDocument.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .content { 
              margin: 30px 0; 
            }
            .signature-section { 
              margin-top: 50px; 
              display: flex; 
              justify-content: space-between;
            }
            .signature-box { 
              border: 2px solid #333; 
              padding: 20px; 
              width: 300px; 
              height: 150px;
            }
            .signature-img { 
              width: 100%; 
              height: 100%; 
              object-fit: contain;
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              font-size: 12px; 
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${currentDocument.title}</h1>
            <p>${currentDocument.description}</p>
          </div>
          
          <div class="content">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            
            ${
              documentInfo
                ? `
              <h3>Service Details</h3>
              <p><strong>Service:</strong> ${
                documentInfo.service || "General Service"
              }</p>
              <p><strong>Amount:</strong> $${documentInfo.amount || "TBD"}</p>
            `
                : ""
            }
            
            <h3>Document Terms</h3>
            <p>${currentDocument.description}</p>
            <ul>
              ${currentDocument.fields
                .map((field) => `<li>${field}</li>`)
                .join("")}
            </ul>
          </div>
          
          <div class="signature-section">
            <div>
              <h4>Customer Signature</h4>
              <div class="signature-box">
                ${
                  signatureData
                    ? `<img src="${signatureData}" class="signature-img" alt="Signature" />`
                    : ""
                }
              </div>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div>
              <h4>Service Advisor</h4>
              <div class="signature-box">
                <!-- Service advisor signature would go here -->
              </div>
              <p><strong>Name:</strong> Service Advisor</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This document was digitally signed and generated on ${new Date().toLocaleString()}</p>
            <p>Electronic signatures are legally binding and equivalent to handwritten signatures.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isOpen) return null;

  return (
    <div className="digital-signature">
      <div className="signature-modal">
        <div className="signature-header">
          <div className="header-title">
            <FaSignature className="signature-icon" />
            <h2>Digital Signature</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="signature-content">
          {!isCompleted ? (
            <>
              {/* Document Selection */}
              <div className="document-selection">
                <h3>Select Document Type</h3>
                <div className="document-types">
                  {Object.entries(documentTypes).map(([key, doc]) => (
                    <button
                      key={key}
                      className={`document-type-btn ${
                        signatureType === key ? "active" : ""
                      }`}
                      onClick={() => setSignatureType(key)}
                    >
                      <div className="doc-info">
                        <h4>{doc.title}</h4>
                        <p>{doc.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Preview */}
              <div
                className={`document-preview ${
                  documentExpanded ? "expanded" : ""
                }`}
              >
                <div className="preview-header">
                  <h3>{currentDocument.title}</h3>
                  <button
                    className="expand-btn"
                    onClick={() => setDocumentExpanded(!documentExpanded)}
                  >
                    {documentExpanded ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>

                <div className="preview-content">
                  <p className="document-description">
                    {currentDocument.description}
                  </p>
                  <div className="document-fields">
                    <h4>Document Includes:</h4>
                    <ul>
                      {currentDocument.fields.map((field, idx) => (
                        <li key={idx}>{field}</li>
                      ))}
                    </ul>
                  </div>

                  {documentInfo && (
                    <div className="service-details">
                      <h4>Service Details</h4>
                      <div className="detail-item">
                        <span>Service:</span>
                        <span>{documentInfo.service || "General Service"}</span>
                      </div>
                      <div className="detail-item">
                        <span>Amount:</span>
                        <span>${documentInfo.amount || "TBD"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Area */}
              <div className="signature-area">
                <div className="signature-controls">
                  <div className="control-group">
                    <label>Customer Name:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="name-input"
                    />
                  </div>

                  <div className="control-group">
                    <label>Stroke Color:</label>
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                    />
                  </div>

                  <div className="control-group">
                    <label>Stroke Width:</label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    />
                    <span>{strokeWidth}px</span>
                  </div>
                </div>

                <div className="canvas-container">
                  <div className="canvas-header">
                    <span>Sign below:</span>
                    <div className="canvas-actions">
                      <button
                        className="action-btn"
                        onClick={undo}
                        disabled={undoStack.length <= 1}
                        title="Undo"
                      >
                        <FaUndo />
                      </button>
                      <button
                        className="action-btn"
                        onClick={redo}
                        disabled={redoStack.length === 0}
                        title="Redo"
                      >
                        <FaRedo />
                      </button>
                      <button
                        className="action-btn clear"
                        onClick={clearCanvas}
                        title="Clear"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="canvas-wrapper">
                    <canvas
                      ref={canvasRef}
                      className="signature-canvas"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        startDrawing(e.touches[0]);
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        draw(e.touches[0]);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        stopDrawing();
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="signature-actions">
                <button
                  className="save-btn"
                  onClick={saveSignature}
                  disabled={!customerName.trim()}
                >
                  <FaCheck />
                  Complete Signature
                </button>
                <button className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            /* Completion View */
            <div className="signature-completed">
              <div className="completion-icon">
                <FaCheck />
              </div>
              <h3>Signature Completed!</h3>
              <p>Your digital signature has been successfully recorded.</p>

              <div className="signature-preview">
                <h4>Signature Preview</h4>
                <div className="preview-box">
                  <img
                    src={signatureData}
                    alt="Signature"
                    className="signature-image"
                  />
                </div>
                <div className="signature-info">
                  <div className="info-item">
                    <span>Signed by:</span>
                    <span>{customerName}</span>
                  </div>
                  <div className="info-item">
                    <span>Document:</span>
                    <span>{currentDocument.title}</span>
                  </div>
                  <div className="info-item">
                    <span>Date & Time:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="completion-actions">
                <button className="download-btn" onClick={downloadSignature}>
                  <FaDownload />
                  Download Signature
                </button>
                <button className="print-btn" onClick={printDocument}>
                  <FaSave />
                  Print Document
                </button>
                <button className="continue-btn" onClick={onClose}>
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalSignature;
